import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Weekend, Player, Team, Event, EventScore } from '../lib/types';

interface GameState {
  weekend: Weekend | null;
  players: Player[];
  teams: Team[];
  previousLeader: string | null;
  events: Event[];
  activeEvent: Event | null;
  eventScores: EventScore[];

  // Weekend actions
  loadWeekend: () => Promise<void>;
  createWeekend: (name: string) => Promise<void>;

  // Player actions
  addPlayer: (name: string, color: string) => Promise<void>;
  removePlayer: (id: string) => Promise<void>;
  updatePlayerTeam: (playerId: string, teamId: string | null) => Promise<void>;

  // Team actions
  addTeam: (name: string, color: string) => Promise<void>;
  removeTeam: (id: string) => Promise<void>;

  // Scoring
  scorePlayer: (playerId: string, points: number) => Promise<void>;
  scoreTeam: (teamId: string, points: number) => Promise<void>;

  // Event actions
  loadEvents: () => Promise<void>;
  createEvent: (name: string) => Promise<void>;
  removeEvent: (id: string) => Promise<void>;
  setActiveEvent: (event: Event | null) => Promise<void>;
  toggleCountsForTotal: () => Promise<void>;
  resetAllScores: () => Promise<void>;

  // Realtime sync setters
  setPlayers: (players: Player[]) => void;
  setTeams: (teams: Team[]) => void;
  upsertPlayer: (player: Player) => void;
  deletePlayer: (id: string) => void;
  upsertTeam: (team: Team) => void;
  deleteTeam: (id: string) => void;
  upsertEvent: (event: Event) => void;
  deleteEvent: (id: string) => void;
  upsertEventScore: (es: EventScore) => void;
  deleteEventScore: (id: string) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  weekend: null,
  players: [],
  teams: [],
  previousLeader: null,
  events: [],
  activeEvent: null,
  eventScores: [],

  loadWeekend: async () => {
    const { data: weekends } = await supabase
      .from('weekend')
      .select('*')
      .eq('is_active', true)
      .limit(1);

    const weekend = weekends?.[0] ?? null;
    set({ weekend });

    if (weekend) {
      const [{ data: players }, { data: teams }, { data: events }] = await Promise.all([
        supabase.from('players').select('*').eq('weekend_id', weekend.id).order('sort_order'),
        supabase.from('teams').select('*').eq('weekend_id', weekend.id).order('sort_order'),
        supabase.from('events').select('*').eq('weekend_id', weekend.id).order('sort_order'),
      ]);
      const sortedPlayers = players ?? [];
      set({
        players: sortedPlayers,
        teams: teams ?? [],
        events: events ?? [],
        previousLeader: sortedPlayers.length > 0
          ? [...sortedPlayers].sort((a, b) => b.score - a.score)[0].id
          : null,
      });
    }
  },

  createWeekend: async (name: string) => {
    const { data } = await supabase
      .from('weekend')
      .insert({ name })
      .select()
      .single();

    if (data) {
      set({ weekend: data, players: [], teams: [], events: [], activeEvent: null, eventScores: [] });
    }
  },

  addPlayer: async (name: string, color: string) => {
    const { weekend, players } = get();
    if (!weekend) return;

    const { data } = await supabase
      .from('players')
      .insert({
        weekend_id: weekend.id,
        name,
        color,
        sort_order: players.length,
      })
      .select()
      .single();

    if (data) {
      set((s) => ({ players: [...s.players, data] }));
    }
  },

  removePlayer: async (id: string) => {
    await supabase.from('players').delete().eq('id', id);
    set((s) => ({ players: s.players.filter((p) => p.id !== id) }));
  },

  updatePlayerTeam: async (playerId: string, teamId: string | null) => {
    const { activeEvent } = get();
    if (activeEvent) {
      await supabase
        .from('event_scores')
        .update({ team_id: teamId })
        .eq('event_id', activeEvent.id)
        .eq('player_id', playerId);
      set((s) => ({
        eventScores: s.eventScores.map((es) =>
          es.player_id === playerId ? { ...es, team_id: teamId } : es
        ),
      }));
    } else {
      await supabase.from('players').update({ team_id: teamId }).eq('id', playerId);
      set((s) => ({
        players: s.players.map((p) =>
          p.id === playerId ? { ...p, team_id: teamId } : p
        ),
      }));
    }
  },

  addTeam: async (name: string, color: string) => {
    const { weekend, teams, activeEvent } = get();
    if (!weekend) return;

    const { data } = await supabase
      .from('teams')
      .insert({
        weekend_id: weekend.id,
        event_id: activeEvent?.id ?? null,
        name,
        color,
        sort_order: teams.length,
      })
      .select()
      .single();

    if (data) {
      set((s) => ({ teams: [...s.teams, data] }));
    }
  },

  removeTeam: async (id: string) => {
    const { activeEvent } = get();
    await supabase.from('teams').delete().eq('id', id);
    set((s) => ({
      teams: s.teams.filter((t) => t.id !== id),
      ...(activeEvent
        ? {
            eventScores: s.eventScores.map((es) =>
              es.team_id === id ? { ...es, team_id: null } : es
            ),
          }
        : {
            players: s.players.map((p) =>
              p.team_id === id ? { ...p, team_id: null } : p
            ),
          }),
    }));
  },

  scorePlayer: async (playerId: string, points: number) => {
    const { activeEvent } = get();
    if (activeEvent) {
      const countsForTotal = activeEvent.counts_for_total;
      // Optimistic update: eventScores always, players.score only if counts_for_total
      set((s) => ({
        players: countsForTotal
          ? s.players.map((p) =>
              p.id === playerId ? { ...p, score: p.score + points } : p
            )
          : s.players,
        eventScores: s.eventScores.map((es) =>
          es.player_id === playerId ? { ...es, score: es.score + points } : es
        ),
      }));
      await supabase.rpc('score_in_event', {
        p_event_id: activeEvent.id,
        p_player_ids: [playerId],
        p_points: points,
        p_counts_for_total: countsForTotal,
      });
    } else {
      set((s) => ({
        players: s.players.map((p) =>
          p.id === playerId ? { ...p, score: p.score + points } : p
        ),
      }));
      await supabase.rpc('add_score', { player_ids: [playerId], points });
    }
  },

  scoreTeam: async (teamId: string, points: number) => {
    const { players, teams, activeEvent, eventScores } = get();
    const team = teams.find((t) => t.id === teamId);
    if (!team) return;

    if (activeEvent) {
      const countsForTotal = activeEvent.counts_for_total;
      const memberIds = eventScores
        .filter((es) => es.team_id === teamId)
        .map((es) => es.player_id);
      if (memberIds.length === 0) return;

      const newTeamScore = team.score + points;
      set((s) => ({
        players: countsForTotal
          ? s.players.map((p) =>
              memberIds.includes(p.id) ? { ...p, score: p.score + points } : p
            )
          : s.players,
        eventScores: s.eventScores.map((es) =>
          memberIds.includes(es.player_id) ? { ...es, score: es.score + points } : es
        ),
        teams: s.teams.map((t) =>
          t.id === teamId ? { ...t, score: newTeamScore } : t
        ),
      }));

      await Promise.all([
        supabase.rpc('score_in_event', {
          p_event_id: activeEvent.id,
          p_player_ids: memberIds,
          p_points: points,
          p_counts_for_total: countsForTotal,
        }),
        supabase.from('teams').update({ score: newTeamScore }).eq('id', teamId),
      ]);
    } else {
      const memberIds = players.filter((p) => p.team_id === teamId).map((p) => p.id);
      if (memberIds.length === 0) return;

      const newTeamScore = team.score + points;
      set((s) => ({
        players: s.players.map((p) =>
          memberIds.includes(p.id) ? { ...p, score: p.score + points } : p
        ),
        teams: s.teams.map((t) =>
          t.id === teamId ? { ...t, score: newTeamScore } : t
        ),
      }));

      await Promise.all([
        supabase.rpc('add_score', { player_ids: memberIds, points }),
        supabase.from('teams').update({ score: newTeamScore }).eq('id', teamId),
      ]);
    }
  },

  loadEvents: async () => {
    const { weekend } = get();
    if (!weekend) return;
    const { data } = await supabase
      .from('events')
      .select('*')
      .eq('weekend_id', weekend.id)
      .order('sort_order');
    set({ events: data ?? [] });
  },

  createEvent: async (name: string) => {
    const { weekend, players, events } = get();
    if (!weekend) return;

    const { data: event } = await supabase
      .from('events')
      .insert({
        weekend_id: weekend.id,
        name,
        sort_order: events.length,
      })
      .select()
      .single();

    if (event) {
      set((s) => ({ events: [...s.events, event] }));

      // Create event_scores for all current players
      if (players.length > 0) {
        const rows = players.map((p) => ({
          event_id: event.id,
          player_id: p.id,
          score: 0,
        }));
        await supabase.from('event_scores').insert(rows);
      }
    }
  },

  removeEvent: async (id: string) => {
    const { activeEvent } = get();
    await supabase.from('events').delete().eq('id', id);
    set((s) => ({
      events: s.events.filter((e) => e.id !== id),
      ...(activeEvent?.id === id
        ? { activeEvent: null, eventScores: [], teams: s.teams.filter((t) => t.event_id !== id) }
        : {}),
    }));
  },

  setActiveEvent: async (event: Event | null) => {
    const { weekend } = get();
    if (!weekend) return;

    set({ activeEvent: event });

    if (event) {
      const [{ data: scores }, { data: teams }] = await Promise.all([
        supabase.from('event_scores').select('*').eq('event_id', event.id),
        supabase.from('teams').select('*').eq('event_id', event.id).order('sort_order'),
      ]);
      set({ eventScores: scores ?? [], teams: teams ?? [] });
    } else {
      const { data: teams } = await supabase
        .from('teams')
        .select('*')
        .eq('weekend_id', weekend.id)
        .is('event_id', null)
        .order('sort_order');
      set({ eventScores: [], teams: teams ?? [] });
    }
  },

  toggleCountsForTotal: async () => {
    const { activeEvent } = get();
    if (!activeEvent) return;

    const newValue = !activeEvent.counts_for_total;
    await supabase
      .from('events')
      .update({ counts_for_total: newValue })
      .eq('id', activeEvent.id);

    const updatedEvent = { ...activeEvent, counts_for_total: newValue };
    set((s) => ({
      activeEvent: updatedEvent,
      events: s.events.map((e) =>
        e.id === activeEvent.id ? updatedEvent : e
      ),
    }));
  },

  resetAllScores: async () => {
    const { weekend, activeEvent } = get();
    if (!weekend) return;

    if (activeEvent) {
      // Reset event scores only
      await Promise.all([
        supabase
          .from('event_scores')
          .update({ score: 0 })
          .eq('event_id', activeEvent.id),
        supabase
          .from('teams')
          .update({ score: 0 })
          .eq('event_id', activeEvent.id),
      ]);
      set((s) => ({
        eventScores: s.eventScores.map((es) => ({ ...es, score: 0 })),
        teams: s.teams.map((t) => ({ ...t, score: 0 })),
      }));
    } else {
      // Reset all player totals and team scores
      await Promise.all([
        supabase
          .from('players')
          .update({ score: 0 })
          .eq('weekend_id', weekend.id),
        supabase
          .from('teams')
          .update({ score: 0 })
          .eq('weekend_id', weekend.id),
        supabase
          .from('event_scores')
          .update({ score: 0 })
          .in('event_id', get().events.map((e) => e.id)),
      ]);
      set((s) => ({
        players: s.players.map((p) => ({ ...p, score: 0 })),
        teams: s.teams.map((t) => ({ ...t, score: 0 })),
      }));
    }
  },

  setPlayers: (players) => set({ players }),
  setTeams: (teams) => set({ teams }),

  upsertPlayer: (player) => {
    set((s) => {
      const idx = s.players.findIndex((p) => p.id === player.id);
      if (idx >= 0) {
        const updated = [...s.players];
        updated[idx] = player;
        return { players: updated };
      }
      return { players: [...s.players, player] };
    });
  },

  deletePlayer: (id) => {
    set((s) => ({ players: s.players.filter((p) => p.id !== id) }));
  },

  upsertTeam: (team) => {
    set((s) => {
      const idx = s.teams.findIndex((t) => t.id === team.id);
      if (idx >= 0) {
        const updated = [...s.teams];
        updated[idx] = team;
        return { teams: updated };
      }
      return { teams: [...s.teams, team] };
    });
  },

  deleteTeam: (id) => {
    set((s) => ({ teams: s.teams.filter((t) => t.id !== id) }));
  },

  upsertEvent: (event) => {
    set((s) => {
      const idx = s.events.findIndex((e) => e.id === event.id);
      if (idx >= 0) {
        const updated = [...s.events];
        updated[idx] = event;
        return { events: updated };
      }
      return { events: [...s.events, event] };
    });
  },

  deleteEvent: (id) => {
    set((s) => ({
      events: s.events.filter((e) => e.id !== id),
      ...(s.activeEvent?.id === id ? { activeEvent: null, eventScores: [] } : {}),
    }));
  },

  upsertEventScore: (es) => {
    set((s) => {
      const idx = s.eventScores.findIndex((x) => x.id === es.id);
      if (idx >= 0) {
        const updated = [...s.eventScores];
        updated[idx] = es;
        return { eventScores: updated };
      }
      return { eventScores: [...s.eventScores, es] };
    });
  },

  deleteEventScore: (id) => {
    set((s) => ({ eventScores: s.eventScores.filter((es) => es.id !== id) }));
  },
}));
