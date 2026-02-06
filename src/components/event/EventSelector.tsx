import { useState } from 'react';
import { Plus } from 'lucide-react';
import { clsx } from 'clsx';
import { useGameStore } from '../../store/useGameStore';
import { CreateEventModal } from './CreateEventModal';

export function EventSelector() {
  const events = useGameStore((s) => s.events);
  const activeEvent = useGameStore((s) => s.activeEvent);
  const setActiveEvent = useGameStore((s) => s.setActiveEvent);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => setActiveEvent(null)}
          className={clsx(
            'shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors',
            activeEvent === null
              ? 'bg-blue-600 text-white'
              : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
          )}
        >
          Totaal
        </button>
        {events.map((event) => (
          <button
            key={event.id}
            onClick={() => setActiveEvent(event)}
            className={clsx(
              'shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors',
              activeEvent?.id === event.id
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
            )}
          >
            {event.name}
          </button>
        ))}
        <button
          onClick={() => setModalOpen(true)}
          className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border border-dashed border-slate-600 text-slate-400 hover:text-slate-200 hover:border-slate-400 hover:bg-slate-800 transition-colors"
        >
          <Plus size={16} />
          Nieuw event
        </button>
      </div>
      <CreateEventModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
