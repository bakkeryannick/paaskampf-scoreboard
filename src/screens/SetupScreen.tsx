import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useGameStore } from '../store/useGameStore';
import { Header } from '../components/layout/Header';
import { AddPlayerForm } from '../components/player/AddPlayerForm';
import { PlayerList } from '../components/player/PlayerList';
import { BigButton } from '../components/ui/BigButton';

export function SetupScreen() {
  const navigate = useNavigate();
  const weekend = useGameStore((s) => s.weekend);
  const players = useGameStore((s) => s.players);
  const createWeekend = useGameStore((s) => s.createWeekend);
  const addPlayer = useGameStore((s) => s.addPlayer);
  const removePlayer = useGameStore((s) => s.removePlayer);

  const [weekendName, setWeekendName] = useState('Paaskampf 2026');

  const handleCreateWeekend = async () => {
    await createWeekend(weekendName);
    toast.success('Weekend aangemaakt!');
  };

  const handleAddPlayer = async (name: string, color: string) => {
    await addPlayer(name, color);
    toast.success(`${name} toegevoegd`);
  };

  const handleStart = () => {
    if (players.length < 2) {
      toast.error('Voeg minimaal 2 spelers toe');
      return;
    }
    navigate('/scoreboard');
  };

  return (
    <div className="min-h-dvh bg-slate-950">
      <Header />
      <main className="max-w-md mx-auto px-4 py-6 flex flex-col gap-6">
        {!weekend ? (
          <section className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold text-slate-100">
              Nieuw Weekend
            </h2>
            <input
              type="text"
              value={weekendName}
              onChange={(e) => setWeekendName(e.target.value)}
              placeholder="Weekend naam..."
              className="min-h-12 px-4 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 text-base"
            />
            <BigButton onClick={handleCreateWeekend} size="lg">
              Weekend Starten
            </BigButton>
          </section>
        ) : (
          <>
            <section className="flex flex-col gap-3">
              <h2 className="text-2xl font-bold text-slate-100">
                Spelers
              </h2>
              <AddPlayerForm
                onAdd={handleAddPlayer}
                usedColors={players.map((p) => p.color)}
              />
            </section>

            {players.length > 0 && (
              <section className="flex flex-col gap-3">
                <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wide">
                  {players.length} speler{players.length !== 1 && 's'}
                </h3>
                <PlayerList
                  players={players}
                  onRemove={removePlayer}
                  showScore={false}
                />
              </section>
            )}

            <BigButton onClick={handleStart} size="lg" className="mt-4">
              Start Scoreboard →
            </BigButton>
          </>
        )}
      </main>
    </div>
  );
}
