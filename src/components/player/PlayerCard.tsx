import { clsx } from 'clsx';
import { Trash2 } from 'lucide-react';
import type { Player } from '../../lib/types';
import { has67InScore, is67RankPair } from '../../lib/detect67';

interface PlayerCardProps {
  player: Player;
  rank?: number;
  onRemove?: () => void;
  onScore?: (points: number) => void;
  showScore?: boolean;
  compact?: boolean;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

const btnClass =
  'min-w-8 h-8 sm:min-w-10 sm:h-10 px-1.5 sm:px-2 rounded-lg text-xs sm:text-sm font-semibold bg-slate-700/60 text-slate-300 hover:bg-slate-600 active:scale-95 shrink-0 transition-colors';

export function PlayerCard({
  player,
  rank,
  onRemove,
  onScore,
  showScore = true,
  compact = false,
  dragHandleProps,
}: PlayerCardProps) {
  return (
    <div
      className={clsx(
        'flex items-center gap-1.5 sm:gap-3 rounded-xl border border-slate-700/60 bg-slate-800/40',
        compact ? 'px-2 py-1.5 sm:px-3 sm:py-2' : 'px-2.5 py-2 sm:px-4 sm:py-3',
      )}
    >
      {dragHandleProps && (
        <div
          {...dragHandleProps}
          className="cursor-grab active:cursor-grabbing text-slate-600 hover:text-slate-400 touch-none shrink-0"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="5" cy="3" r="1.5" />
            <circle cx="11" cy="3" r="1.5" />
            <circle cx="5" cy="8" r="1.5" />
            <circle cx="11" cy="8" r="1.5" />
            <circle cx="5" cy="13" r="1.5" />
            <circle cx="11" cy="13" r="1.5" />
          </svg>
        </div>
      )}

      {rank != null && (
        <span className={clsx(
          'font-bold shrink-0 w-6 text-center',
          rank <= 3 ? 'text-base text-slate-300' : 'text-sm text-slate-500',
          is67RankPair(rank) && 'easter-67'
        )}>
          {rank}
        </span>
      )}

      <div
        className="w-2.5 h-2.5 rounded-full shrink-0"
        style={{ backgroundColor: player.color }}
      />

      <span className="font-medium text-sm sm:text-base text-slate-100 flex-1 min-w-0 truncate">
        {player.name}
      </span>

      {onScore && (
        <button
          onClick={(e) => { e.stopPropagation(); onScore(-1); }}
          className={btnClass}
        >
          -1
        </button>
      )}

      {showScore && (
        <span
          className={clsx(
            'font-black tabular-nums text-center shrink-0',
            compact ? 'text-lg sm:text-xl min-w-[2ch]' : 'text-lg sm:text-2xl min-w-[2ch] sm:min-w-[2.5ch]',
            has67InScore(player.score) && 'easter-67',
          )}
          style={has67InScore(player.score) ? undefined : { color: player.color }}
        >
          {player.score}
        </span>
      )}

      {onScore && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); onScore(1); }}
            className={btnClass}
          >
            +1
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onScore(5); }}
            className={btnClass}
          >
            +5
          </button>
        </>
      )}

      {onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="p-2 rounded-lg text-slate-600 hover:text-slate-300 hover:bg-slate-700 shrink-0 transition-colors"
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );
}
