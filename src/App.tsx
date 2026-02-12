import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useGameStore } from './store/useGameStore';
import { useRealtimeSync } from './hooks/useRealtimeSync';
import { useConfetti } from './hooks/useConfetti';
import { SetupScreen } from './screens/SetupScreen';
import { ScoreboardScreen } from './screens/ScoreboardScreen';
import { TVScreen } from './screens/TVScreen';
import { EventsScreen } from './screens/EventsScreen';
import { PinScreen } from './screens/PinScreen';
import { LiveScreen } from './screens/LiveScreen';

function AppInner() {
  const loadWeekend = useGameStore((s) => s.loadWeekend);
  const [verified, setVerified] = useState(
    () => sessionStorage.getItem('pin_verified') === '1'
  );
  const location = useLocation();

  useEffect(() => {
    loadWeekend();
  }, [loadWeekend]);

  useRealtimeSync();
  useConfetti();

  // /live is publicly accessible without PIN
  if (location.pathname === '/live') {
    return (
      <Routes>
        <Route path="/live" element={<LiveScreen />} />
      </Routes>
    );
  }

  if (!verified) {
    return <PinScreen onSuccess={() => setVerified(true)} />;
  }

  return (
    <Routes>
      <Route path="/" element={<SetupScreen />} />
      <Route path="/scoreboard" element={<ScoreboardScreen />} />
      <Route path="/events" element={<EventsScreen />} />
      <Route path="/tv" element={<TVScreen />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        theme="dark"
        toastOptions={{
          style: {
            background: '#1e293b',
            border: '1px solid #334155',
            color: '#f1f5f9',
          },
        }}
      />
      <AppInner />
    </BrowserRouter>
  );
}
