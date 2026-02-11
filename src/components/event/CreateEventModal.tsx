import { useState } from 'react';
import { toast } from 'sonner';
import { useGameStore } from '../../store/useGameStore';
import { Modal } from '../ui/Modal';
import { BigButton } from '../ui/BigButton';

interface CreateEventModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateEventModal({ open, onClose }: CreateEventModalProps) {
  const createEvent = useGameStore((s) => s.createEvent);
  const [name, setName] = useState('');
  const [reverseScoring, setReverseScoring] = useState(false);

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    await createEvent(trimmed, reverseScoring);
    toast.success(`Event "${trimmed}" aangemaakt`);
    setName('');
    setReverseScoring(false);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Nieuw Event">
      <div className="flex flex-col gap-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Event naam..."
          className="min-h-12 px-4 rounded-xl bg-slate-700 border border-slate-600 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 text-base"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleCreate();
          }}
        />
        <button
          type="button"
          onClick={() => setReverseScoring(!reverseScoring)}
          className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-700/60 border border-slate-600 transition-colors hover:bg-slate-700"
        >
          <div
            className={`relative w-12 h-7 rounded-full transition-colors ${
              reverseScoring ? 'bg-blue-600' : 'bg-slate-600'
            }`}
          >
            <div
              className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${
                reverseScoring ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </div>
          <span className="text-sm font-semibold text-slate-200">
            Laagste score wint (bijv. golf)
          </span>
        </button>
        <BigButton onClick={handleCreate} disabled={!name.trim()}>
          Start Event
        </BigButton>
      </div>
    </Modal>
  );
}
