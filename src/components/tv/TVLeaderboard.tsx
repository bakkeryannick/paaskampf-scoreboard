import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Medal } from 'lucide-react';
import type { Player } from '../../lib/types';
import { has67InScore, is67RankPair } from '../../lib/detect67';

interface TVLeaderboardProps {
  players: Player[];
  reverseScoring?: boolean;
}

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Trophy className="text-yellow-400 w-6 h-6 sm:w-8 sm:h-8" />;
  if (rank === 2) return <Medal className="text-slate-300 w-5 h-5 sm:w-7 sm:h-7" />;
  if (rank === 3) return <Medal className="text-amber-600 w-5 h-5 sm:w-7 sm:h-7" />;
  return (
    <span className={`text-xl sm:text-3xl font-bold text-slate-600 w-6 sm:w-8 text-center${is67RankPair(rank) ? ' easter-67' : ''}`}>
      {rank}
    </span>
  );
}

function PlayerRow({ player, rank }: { player: Player; rank: number }) {
  const isTop3 = rank <= 3;
  return (
    <motion.div
      key={player.id}
      layout
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`flex items-center gap-2 sm:gap-4 rounded-xl sm:rounded-2xl px-3 sm:px-6 ${
        isTop3 ? 'py-3 sm:py-5' : 'py-2.5 sm:py-4'
      } ${
        rank === 1
          ? 'bg-yellow-500/10 border border-yellow-500/30'
          : 'bg-slate-800/50 border border-slate-700/50'
      }`}
    >
      <RankIcon rank={rank} />
      <div
        className={`w-3 sm:w-4 ${isTop3 ? 'h-3 sm:h-4' : 'h-2.5 sm:h-3'} rounded-full shrink-0`}
        style={{ backgroundColor: player.color }}
      />
      <span
        className={`font-semibold text-slate-100 flex-1 min-w-0 truncate ${
          isTop3 ? 'text-lg sm:text-3xl' : 'text-base sm:text-2xl'
        }`}
      >
        {player.name}
      </span>
      <motion.span
        key={player.score}
        initial={{ scale: 1.4 }}
        animate={{ scale: 1 }}
        className={`font-black tabular-nums shrink-0 ${
          isTop3 ? 'text-xl sm:text-4xl' : 'text-lg sm:text-3xl'
        }${has67InScore(player.score) ? ' easter-67' : ''}`}
        style={has67InScore(player.score) ? undefined : { color: player.color }}
      >
        {player.score}
      </motion.span>
    </motion.div>
  );
}

export function TVLeaderboard({ players, reverseScoring = false }: TVLeaderboardProps) {
  const sorted = [...players].sort((a, b) =>
    reverseScoring ? a.score - b.score : b.score - a.score
  );
  const mid = Math.ceil(sorted.length / 2);
  const left = sorted.slice(0, mid);
  const right = sorted.slice(mid);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 w-full max-w-5xl mx-auto">
      <div className="flex flex-col gap-3">
        <AnimatePresence mode="popLayout">
          {left.map((player, i) => (
            <PlayerRow key={player.id} player={player} rank={i + 1} />
          ))}
        </AnimatePresence>
      </div>
      <div className="flex flex-col gap-3">
        <AnimatePresence mode="popLayout">
          {right.map((player, i) => (
            <PlayerRow key={player.id} player={player} rank={mid + i + 1} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
