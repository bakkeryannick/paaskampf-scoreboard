import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
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

  const liveUrl = `${window.location.origin}/live`;

  return (
    <div className="min-h-dvh bg-slate-950 flex flex-col">
      <header className="px-4 py-4 sm:py-6">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <Link
            to="/scoreboard"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft size={18} />
            <span>Terug</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 hidden sm:inline">Scan voor scores</span>
            <QRCodeSVG
              value={liveUrl}
              size={48}
              bgColor="transparent"
              fgColor="#94a3b8"
              className="sm:w-[64px] sm:h-[64px]"
            />
          </div>
        </div>
        <div className="text-center">
          <h1 className="text-2xl sm:text-4xl font-black text-slate-100 tracking-tight">
            {weekend?.name ?? 'Paaskampf'}
          </h1>
          {activeEvent && (
            <p className="text-base sm:text-lg text-slate-400 mt-1">{activeEvent.name}</p>
          )}
        </div>
      </header>
      <main className="flex-1 px-3 sm:px-6 pb-8">
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
