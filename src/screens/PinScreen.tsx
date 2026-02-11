import { useState } from 'react';

const PIN = '5122';

interface PinScreenProps {
  onSuccess: () => void;
}

export function PinScreen({ onSuccess }: PinScreenProps) {
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = () => {
    if (value === PIN) {
      sessionStorage.setItem('pin_verified', '1');
      onSuccess();
    } else {
      setError(true);
      setValue('');
    }
  };

  return (
    <div className="min-h-dvh bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-xs flex flex-col items-center gap-6">
        <h1 className="text-3xl font-black text-slate-100 tracking-tight">
          Paaskampf
        </h1>
        <p className="text-slate-400 text-sm">Voer de PIN in om verder te gaan</p>
        <input
          type="password"
          inputMode="numeric"
          maxLength={4}
          value={value}
          onChange={(e) => {
            setError(false);
            setValue(e.target.value.replace(/\D/g, ''));
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit();
          }}
          placeholder="••••"
          autoFocus
          className={`w-full text-center text-3xl tracking-[0.5em] min-h-14 px-4 rounded-xl bg-slate-800 border ${
            error ? 'border-red-500' : 'border-slate-600'
          } text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500`}
        />
        {error && (
          <p className="text-red-400 text-sm">Onjuiste PIN, probeer opnieuw</p>
        )}
        <button
          onClick={handleSubmit}
          disabled={value.length < 4}
          className="w-full min-h-12 rounded-xl bg-blue-600 text-white font-bold text-base hover:bg-blue-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Doorgaan
        </button>
      </div>
    </div>
  );
}
