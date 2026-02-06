import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { useMemo, useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { TeamZone } from './TeamZone';
import { TeamActions } from './TeamActions';
import { UnassignedZone } from './UnassignedZone';
import { PlayerCard } from '../player/PlayerCard';
import type { Player } from '../../lib/types';

export function TeamGrid() {
  const players = useGameStore((s) => s.players);
  const teams = useGameStore((s) => s.teams);
  const removeTeam = useGameStore((s) => s.removeTeam);
  const updatePlayerTeam = useGameStore((s) => s.updatePlayerTeam);
  const scorePlayer = useGameStore((s) => s.scorePlayer);
  const scoreTeam = useGameStore((s) => s.scoreTeam);
  const activeEvent = useGameStore((s) => s.activeEvent);
  const eventScores = useGameStore((s) => s.eventScores);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  // In event mode, use event_scores.team_id for membership; in totaal mode, use players.team_id
  const teamMembershipMap = useMemo(() => {
    const map = new Map<string | null, Player[]>();
    if (activeEvent) {
      const esTeamMap = new Map(eventScores.map((es) => [es.player_id, es.team_id]));
      const esScoreMap = new Map(eventScores.map((es) => [es.player_id, es.score]));
      for (const p of players) {
        const teamId = esTeamMap.get(p.id) ?? null;
        const displayPlayer = { ...p, score: esScoreMap.get(p.id) ?? 0 };
        if (!map.has(teamId)) map.set(teamId, []);
        map.get(teamId)!.push(displayPlayer);
      }
    } else {
      for (const p of players) {
        if (!map.has(p.team_id)) map.set(p.team_id, []);
        map.get(p.team_id)!.push(p);
      }
    }
    return map;
  }, [activeEvent, players, eventScores]);

  const unassigned = teamMembershipMap.get(null) ?? [];
  const activePlayer = activeId ? players.find((p) => p.id === activeId) : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const playerId = active.id as string;
    const overId = over.id as string;

    if (overId === 'unassigned') {
      updatePlayerTeam(playerId, null);
    } else if (overId.startsWith('team-')) {
      const teamId = overId.replace('team-', '');
      updatePlayerTeam(playerId, teamId);
    }
  };

  if (teams.length === 0) return null;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wide">
            Teams
          </h3>
          <TeamActions />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {teams.map((team) => (
            <TeamZone
              key={team.id}
              team={team}
              members={teamMembershipMap.get(team.id) ?? []}
              onRemoveTeam={() => removeTeam(team.id)}
              onScoreTeam={(pts) => scoreTeam(team.id, pts)}
              onScorePlayer={(pid, pts) => scorePlayer(pid, pts)}
            />
          ))}
        </div>

        {unassigned.length > 0 && (
          <UnassignedZone
            players={unassigned}
            onScorePlayer={(pid, pts) => scorePlayer(pid, pts)}
          />
        )}
      </section>

      <DragOverlay>
        {activePlayer && (
          <div className="opacity-80">
            <PlayerCard player={activePlayer} compact />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
