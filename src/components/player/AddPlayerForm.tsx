import { useState } from 'react';
import { Plus } from 'lucide-react';
import { BigButton } from '../ui/BigButton';
import { PLAYER_COLORS } from '../../lib/constants';
import { clsx } from 'clsx';

interface AddPlayerFormProps {
  onAdd: (name: string, color: string) => void;
  usedColors?: string[];
}

export function AddPlayerForm({ onAdd, usedColors = [] }: AddPlayerFormProps) {
  const [name, setName] = useState('');
  const nextColor =
    PLAYER_COLORS.find((c) => !usedColors.includes(c)) ?? PLAYER_COLORS[0];
  const [color, setColor] = useState(nextColor);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd(trimmed, color);
    setName('');
    const newNext =
      PLAYER_COLORS.find((c) => !usedColors.includes(c) && c !== color) ??
      PLAYER_COLORS[0];
    setColor(newNext);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Naam..."
          className="flex-1 min-h-12 px-4 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 text-base"
          autoComplete="off"
        />
        <BigButton type="submit" disabled={!name.trim()}>
          <Plus size={20} />
        </BigButton>
      </div>
      <div className="flex gap-2 flex-wrap">
        {PLAYER_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setColor(c)}
            className={clsx(
              'w-8 h-8 rounded-full transition-transform',
              color === c && 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110'
            )}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
    </form>
  );
}
