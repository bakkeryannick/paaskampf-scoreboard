import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { useGameStore } from '../../store/useGameStore';
import { Modal } from '../ui/Modal';
import type { Event, EventScore } from '../../lib/types';

interface EventWithScores extends Event {
  topPlayers: { name: string; color: string; score: number }[];
}

export function EventOverview() {
  const events = useGameStore((s) => s.events);
  const players = useGameStore((s) => s.players);
  const setActiveEvent = useGameStore((s) => s.setActiveEvent);
  const removeEvent = useGameStore((s) => s.removeEvent);
  const navigate = useNavigate();
  const [enriched, setEnriched] = useState<EventWithScores[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<EventWithScores | null>(null);

  useEffect(() => {
    async function load() {
      if (events.length === 0) {
        setEnriched([]);
        return;
      }

      const { data: allScores } = await supabase
        .from('event_scores')
        .select('*')
        .in('event_id', events.map((e) => e.id));

      const scores = (allScores ?? []) as EventScore[];
      const playerMap = new Map(players.map((p) => [p.id, p]));

      const result = events.map((event) => {
        const eventScores = scores
          .filter((s) => s.event_id === event.id)
          .sort((a, b) =>
            event.reverse_scoring ? a.score - b.score : b.score - a.score
          )
          .slice(0, 3);

        const topPlayers = eventScores.map((s) => {
          const player = playerMap.get(s.player_id);
          return {
            name: player?.name ?? '?',
            color: player?.color ?? '#666',
            score: s.score,
          };
        });

        return { ...event, topPlayers };
      });

      setEnriched(result);
    }

    load();
  }, [events, players]);

  const handleClick = (event: Event) => {
    setActiveEvent(event);
    navigate('/scoreboard');
  };

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 text-lg">Nog geen events aangemaakt.</p>
        <p className="text-slate-600 text-sm mt-1">
          Maak een event aan via het Scoreboard.
        </p>
      </div>
    );
  }

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await removeEvent(deleteTarget.id);
    toast.success(`"${deleteTarget.name}" verwijderd`);
    setDeleteTarget(null);
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {enriched.map((event) => (
          <button
            key={event.id}
            onClick={() => handleClick(event)}
            className="text-left rounded-2xl border border-slate-700/60 bg-slate-800/40 p-4 hover:bg-slate-800/70 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-bold text-slate-100">{event.name}</h3>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteTarget(event);
                }}
                className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-700/60 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
            {event.topPlayers.length > 0 ? (
              <div className="flex flex-col gap-1.5">
                {event.topPlayers.map((p, i) => (
                  <div key={i} className="flex items-center gap-2">
                    {i === 0 && <Trophy size={14} className="text-yellow-400 shrink-0" />}
                    {i === 1 && <Trophy size={14} className="text-slate-400 shrink-0" />}
                    {i === 2 && <Trophy size={14} className="text-amber-600 shrink-0" />}
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: p.color }}
                    />
                    <span className="text-sm text-slate-300 flex-1 truncate">{p.name}</span>
                    <span
                      className="text-sm font-bold tabular-nums"
                      style={{ color: p.color }}
                    >
                      {p.score}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Nog geen scores</p>
            )}
          </button>
        ))}
      </div>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Event verwijderen"
      >
        <p className="text-slate-300 mb-4">
          Weet je zeker dat je <strong>"{deleteTarget?.name}"</strong> wilt
          verwijderen? Alle scores en teams van dit event worden ook verwijderd.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setDeleteTarget(null)}
            className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors"
          >
            Annuleren
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-500 transition-colors"
          >
            Verwijderen
          </button>
        </div>
      </Modal>
    </>
  );
}
