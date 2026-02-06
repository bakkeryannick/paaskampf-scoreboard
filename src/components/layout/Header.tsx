import { Link, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import { Calendar, Settings, Trophy, Tv } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';

export function Header() {
  const location = useLocation();
  const weekend = useGameStore((s) => s.weekend);

  const links = [
    { to: '/', label: 'Setup', icon: Settings },
    { to: '/scoreboard', label: 'Scoreboard', icon: Trophy },
    { to: '/events', label: 'Events', icon: Calendar },
    { to: '/tv', label: 'TV', icon: Tv },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <h1 className="text-lg font-bold text-slate-100 truncate">
          {weekend?.name ?? 'Paaskampf'}
        </h1>
        <nav className="flex gap-1">
          {links.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                location.pathname === to
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              )}
            >
              <Icon size={16} />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
