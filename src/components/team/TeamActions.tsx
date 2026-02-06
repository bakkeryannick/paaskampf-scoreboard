import { useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useGameStore } from '../../store/useGameStore';
import { Modal } from '../ui/Modal';
import { BigButton } from '../ui/BigButton';
import { TEAM_COLORS } from '../../lib/constants';
import { clsx } from 'clsx';

export function TeamActions() {
  const addTeam = useGameStore((s) => s.addTeam);
  const teams = useGameStore((s) => s.teams);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const usedColors = teams.map((t) => t.color);
  const nextColor =
    TEAM_COLORS.find((c) => !usedColors.includes(c)) ?? TEAM_COLORS[0];
  const [color, setColor] = useState(nextColor);

  const handleAdd = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    await addTeam(trimmed, color);
    toast.success(`Team "${trimmed}" aangemaakt`);
    setName('');
    setOpen(false);
    const newNext =
      TEAM_COLORS.find((c) => !usedColors.includes(c) && c !== color) ??
      TEAM_COLORS[0];
    setColor(newNext);
  };

  return (
    <>
      <BigButton
        variant="secondary"
        size="sm"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5"
      >
        <Plus size={16} />
        Team
      </BigButton>
      <Modal open={open} onClose={() => setOpen(false)} title="Nieuw Team">
        <div className="flex flex-col gap-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Team naam..."
            className="min-h-12 px-4 rounded-xl bg-slate-700 border border-slate-600 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 text-base"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd();
            }}
          />
          <div className="flex gap-2 flex-wrap">
            {TEAM_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={clsx(
                  'w-8 h-8 rounded-full transition-transform',
                  color === c &&
                    'ring-2 ring-white ring-offset-2 ring-offset-slate-800 scale-110'
                )}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <BigButton onClick={handleAdd} disabled={!name.trim()}>
            Toevoegen
          </BigButton>
        </div>
      </Modal>
    </>
  );
}
