import { Header } from '../components/layout/Header';
import { EventOverview } from '../components/event/EventOverview';

export function EventsScreen() {
  return (
    <div className="min-h-dvh bg-slate-950">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-4 pb-8">
        <h2 className="text-xl font-bold text-slate-100 mb-4">Events</h2>
        <EventOverview />
      </main>
    </div>
  );
}
