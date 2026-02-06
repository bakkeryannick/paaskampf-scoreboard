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

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    await createEvent(trimmed);
    toast.success(`Event "${trimmed}" aangemaakt`);
    setName('');
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
        <BigButton onClick={handleCreate} disabled={!name.trim()}>
          Start Event
        </BigButton>
      </div>
    </Modal>
  );
}
