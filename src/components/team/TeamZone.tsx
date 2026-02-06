import { Trash2 } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import { clsx } from 'clsx';
import type { Team, Player } from '../../lib/types';
import { DraggablePlayerCard } from './DraggablePlayerCard';

interface TeamZoneProps {
  team: Team;
  members: Player[];
  onRemoveTeam: () => void;
  onScoreTeam?: (points: number) => void;
  onScorePlayer?: (playerId: string, points: number) => void;
}

const btnClass =
  'min-w-8 h-8 px-1.5 rounded-lg text-xs font-semibold bg-slate-700/60 text-slate-300 hover:bg-slate-600 active:scale-95 transition-colors';

export function TeamZone({
  team,
  members,
  onRemoveTeam,
  onScoreTeam,
  onScorePlayer,
}: TeamZoneProps) {
  const { setNodeRef, isOver } = useDroppable({ id: `team-${team.id}` });

  return (
    <div
      ref={setNodeRef}
      className={clsx(
        'rounded-2xl border-2 border-dashed p-3 transition-colors min-h-[100px]',
        isOver ? 'border-white/50 bg-white/5' : 'border-slate-700 bg-slate-800/30'
      )}
      style={{ borderColor: isOver ? team.color : undefined }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-3 h-3 rounded-full shrink-0"
          style={{ backgroundColor: team.color }}
        />
        <h3 className="font-semibold text-slate-100 flex-1 truncate">
          {team.name}
        </h3>
        {onScoreTeam && (
          <button onClick={() => onScoreTeam(-1)} className={btnClass}>
            -1
          </button>
        )}
        <span
          className="text-xl font-black tabular-nums"
          style={{ color: team.color }}
        >
          {team.score}
        </span>
        {onScoreTeam && (
          <>
            <button onClick={() => onScoreTeam(1)} className={btnClass}>
              +1
            </button>
            <button onClick={() => onScoreTeam(5)} className={btnClass}>
              +5
            </button>
          </>
        )}
        <button
          onClick={onRemoveTeam}
          className="p-1.5 rounded-lg text-slate-600 hover:text-slate-300 hover:bg-slate-700 transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
      <div className="flex flex-col gap-1.5">
        {members.map((player) => (
          <DraggablePlayerCard
            key={player.id}
            player={player}
            onScore={onScorePlayer ? (pts) => onScorePlayer(player.id, pts) : undefined}
          />
        ))}
        {members.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-4">
            Sleep spelers hierheen
          </p>
        )}
      </div>
    </div>
  );
}
