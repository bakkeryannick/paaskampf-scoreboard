import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Medal } from 'lucide-react';
import type { Player } from '../../lib/types';

interface TVLeaderboardProps {
  players: Player[];
  reverseScoring?: boolean;
}

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Trophy size={32} className="text-yellow-400" />;
  if (rank === 2) return <Medal size={28} className="text-slate-300" />;
  if (rank === 3) return <Medal size={28} className="text-amber-600" />;
  return (
    <span className="text-3xl font-bold text-slate-600 w-8 text-center">
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
      className={`flex items-center gap-4 rounded-2xl px-6 ${
        isTop3 ? 'py-5' : 'py-4'
      } ${
        rank === 1
          ? 'bg-yellow-500/10 border border-yellow-500/30'
          : 'bg-slate-800/50 border border-slate-700/50'
      }`}
    >
      <RankIcon rank={rank} />
      <div
        className={`w-4 ${isTop3 ? 'h-4' : 'h-3'} rounded-full shrink-0`}
        style={{ backgroundColor: player.color }}
      />
      <span
        className={`font-semibold text-slate-100 flex-1 truncate ${
          isTop3 ? 'text-3xl' : 'text-2xl'
        }`}
      >
        {player.name}
      </span>
      <motion.span
        key={player.score}
        initial={{ scale: 1.4 }}
        animate={{ scale: 1 }}
        className={`font-black tabular-nums ${
          isTop3 ? 'text-4xl' : 'text-3xl'
        }`}
        style={{ color: player.color }}
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
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-5xl mx-auto">
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
