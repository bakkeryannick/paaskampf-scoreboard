import { useMemo, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useGameStore } from '../store/useGameStore';
import { Header } from '../components/layout/Header';
import { PlayerList } from '../components/player/PlayerList';
import { TeamGrid } from '../components/team/TeamGrid';
import { TeamActions } from '../components/team/TeamActions';
import { EventSelector } from '../components/event/EventSelector';
import { Modal } from '../components/ui/Modal';
import { BigButton } from '../components/ui/BigButton';
import type { Player } from '../lib/types';

export function ScoreboardScreen() {
  const players = useGameStore((s) => s.players);
  const teams = useGameStore((s) => s.teams);
  const scorePlayer = useGameStore((s) => s.scorePlayer);
  const activeEvent = useGameStore((s) => s.activeEvent);
  const eventScores = useGameStore((s) => s.eventScores);
  const toggleCountsForTotal = useGameStore((s) => s.toggleCountsForTotal);
  const resetAllScores = useGameStore((s) => s.resetAllScores);
  const [resetModalOpen, setResetModalOpen] = useState(false);

  // When in event mode, build virtual players with event-specific scores for the ranking list
  const displayPlayers: Player[] = useMemo(() => {
    if (!activeEvent) return players;

    const scoreMap = new Map(eventScores.map((es) => [es.player_id, es.score]));
    return players.map((p) => ({
      ...p,
      score: scoreMap.get(p.id) ?? 0,
    }));
  }, [activeEvent, players, eventScores]);

  const handleReset = async () => {
    await resetAllScores();
    toast.success(
      activeEvent
        ? `Scores voor "${activeEvent.name}" gewist`
        : 'Alle scores gewist'
    );
    setResetModalOpen(false);
  };

  return (
    <div className="min-h-dvh bg-slate-950">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-4 pb-8 flex flex-col gap-6">
        <EventSelector />

        {activeEvent && (
          <div className="flex items-center gap-3">
            <button
              onClick={toggleCountsForTotal}
              className="flex items-center gap-3 flex-1 px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700/60 transition-colors hover:bg-slate-800"
            >
              <div
                className={`relative w-12 h-7 rounded-full transition-colors ${
                  activeEvent.counts_for_total ? 'bg-blue-600' : 'bg-slate-600'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${
                    activeEvent.counts_for_total ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </div>
              <span className="text-sm font-semibold text-slate-200">
                {activeEvent.counts_for_total
                  ? 'Telt mee voor totaal'
                  : 'Telt niet mee voor totaal'}
              </span>
            </button>
          </div>
        )}

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-100">
              {activeEvent ? activeEvent.name : 'Ranking'}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setResetModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors"
              >
                <Trash2 size={14} />
                <span className="hidden sm:inline">Reset</span>
              </button>
              {teams.length === 0 && <TeamActions />}
            </div>
          </div>
          <PlayerList
            players={displayPlayers}
            ranked
            onScore={(playerId, pts) => scorePlayer(playerId, pts)}
          />
        </section>

        <TeamGrid />
      </main>

      <Modal
        open={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        title="Scores wissen"
      >
        <div className="flex flex-col gap-4">
          <p className="text-slate-300">
            {activeEvent
              ? `Weet je zeker dat je alle scores voor "${activeEvent.name}" wilt wissen? Dit kan niet ongedaan worden.`
              : 'Weet je zeker dat je ALLE scores wilt wissen? Dit reset alle spelers en events naar 0. Dit kan niet ongedaan worden.'}
          </p>
          <div className="flex gap-3">
            <BigButton
              variant="secondary"
              className="flex-1"
              onClick={() => setResetModalOpen(false)}
            >
              Annuleren
            </BigButton>
            <BigButton
              variant="danger"
              className="flex-1"
              onClick={handleReset}
            >
              Wissen
            </BigButton>
          </div>
        </div>
      </Modal>
    </div>
  );
}
