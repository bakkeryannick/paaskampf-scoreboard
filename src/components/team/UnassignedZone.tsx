import { useDroppable } from '@dnd-kit/core';
import { clsx } from 'clsx';
import type { Player } from '../../lib/types';
import { DraggablePlayerCard } from './DraggablePlayerCard';

interface UnassignedZoneProps {
  players: Player[];
  onScorePlayer?: (playerId: string, points: number) => void;
}

export function UnassignedZone({ players, onScorePlayer }: UnassignedZoneProps) {
  const { setNodeRef, isOver } = useDroppable({ id: 'unassigned' });

  return (
    <div
      ref={setNodeRef}
      className={clsx(
        'rounded-2xl border-2 border-dashed p-3 transition-colors',
        isOver
          ? 'border-slate-400 bg-white/5'
          : 'border-slate-700 bg-slate-800/30'
      )}
    >
      <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
        Zonder team
      </h4>
      <div className="flex flex-col gap-1.5">
        {players.map((player) => (
          <DraggablePlayerCard
            key={player.id}
            player={player}
            onScore={onScorePlayer ? (pts) => onScorePlayer(player.id, pts) : undefined}
          />
        ))}
      </div>
    </div>
  );
}
