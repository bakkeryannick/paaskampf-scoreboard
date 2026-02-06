import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useGameStore } from '../store/useGameStore';
import { REALTIME_CHANNEL } from '../lib/constants';
import type { Player, Team, Event, EventScore } from '../lib/types';

export function useRealtimeSync() {
  const weekend = useGameStore((s) => s.weekend);
  const activeEvent = useGameStore((s) => s.activeEvent);
  const upsertPlayer = useGameStore((s) => s.upsertPlayer);
  const deletePlayer = useGameStore((s) => s.deletePlayer);
  const upsertTeam = useGameStore((s) => s.upsertTeam);
  const deleteTeam = useGameStore((s) => s.deleteTeam);
  const upsertEvent = useGameStore((s) => s.upsertEvent);
  const deleteEvent = useGameStore((s) => s.deleteEvent);

  useEffect(() => {
    if (!weekend) return;

    const channel = supabase
      .channel(REALTIME_CHANNEL)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'players', filter: `weekend_id=eq.${weekend.id}` },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            deletePlayer((payload.old as { id: string }).id);
          } else {
            upsertPlayer(payload.new as Player);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'teams' },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            deleteTeam((payload.old as { id: string }).id);
          } else {
            const team = payload.new as Team;
            if (team.weekend_id === weekend.id) {
              upsertTeam(team);
            }
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'events', filter: `weekend_id=eq.${weekend.id}` },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            deleteEvent((payload.old as { id: string }).id);
          } else {
            upsertEvent(payload.new as Event);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [weekend, upsertPlayer, deletePlayer, upsertTeam, deleteTeam, upsertEvent, deleteEvent]);

  // Separate subscription for event_scores, re-subscribes when activeEvent changes
  const upsertEventScore = useGameStore((s) => s.upsertEventScore);
  const deleteEventScore = useGameStore((s) => s.deleteEventScore);

  useEffect(() => {
    if (!activeEvent) return;

    const channel = supabase
      .channel('event-scores')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'event_scores', filter: `event_id=eq.${activeEvent.id}` },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            deleteEventScore((payload.old as { id: string }).id);
          } else {
            upsertEventScore(payload.new as EventScore);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeEvent, upsertEventScore, deleteEventScore]);
}
