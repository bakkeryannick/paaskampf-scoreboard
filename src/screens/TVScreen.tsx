import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { TVLeaderboard } from '../components/tv/TVLeaderboard';
import type { Player } from '../lib/types';

export function TVScreen() {
  const weekend = useGameStore((s) => s.weekend);
  const players = useGameStore((s) => s.players);
  const activeEvent = useGameStore((s) => s.activeEvent);
  const eventScores = useGameStore((s) => s.eventScores);

  const displayPlayers: Player[] = useMemo(() => {
    if (!activeEvent) return players;
    const scoreMap = new Map(eventScores.map((es) => [es.player_id, es.score]));
    return players.map((p) => ({
      ...p,
      score: scoreMap.get(p.id) ?? 0,
    }));
  }, [activeEvent, players, eventScores]);

  return (
    <div className="min-h-dvh bg-slate-950 flex flex-col">
      <header className="relative text-center py-6">
        <Link
          to="/scoreboard"
          className="absolute left-4 top-6 flex items-center gap-1 text-sm text-slate-600 hover:text-slate-400 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Terug</span>
        </Link>
        <h1 className="text-4xl font-black text-slate-100 tracking-tight">
          {weekend?.name ?? 'Paaskampf'}
        </h1>
        {activeEvent && (
          <p className="text-lg text-slate-400 mt-1">{activeEvent.name}</p>
        )}
      </header>
      <main className="flex-1 px-6 pb-8">
        {players.length === 0 ? (
          <p className="text-center text-2xl text-slate-500 mt-20">
            Wachten op spelers...
          </p>
        ) : (
          <TVLeaderboard
            players={displayPlayers}
            reverseScoring={activeEvent?.reverse_scoring}
          />
        )}
      </main>
    </div>
  );
}
