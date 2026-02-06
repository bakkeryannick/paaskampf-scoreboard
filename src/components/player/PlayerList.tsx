import { PlayerCard } from './PlayerCard';
import type { Player } from '../../lib/types';

interface PlayerListProps {
  players: Player[];
  ranked?: boolean;
  onRemove?: (id: string) => void;
  onScore?: (playerId: string, points: number) => void;
  showScore?: boolean;
}

export function PlayerList({
  players,
  ranked = false,
  onRemove,
  onScore,
  showScore = true,
}: PlayerListProps) {
  const sorted = ranked
    ? [...players].sort((a, b) => b.score - a.score)
    : players;

  const mid = Math.ceil(sorted.length / 2);
  const left = sorted.slice(0, mid);
  const right = sorted.slice(mid);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      <div className="flex flex-col gap-2">
        {left.map((player, i) => (
          <PlayerCard
            key={player.id}
            player={player}
            rank={ranked ? i + 1 : undefined}
            onScore={onScore ? (pts) => onScore(player.id, pts) : undefined}
            onRemove={onRemove ? () => onRemove(player.id) : undefined}
            showScore={showScore}
          />
        ))}
      </div>
      <div className="flex flex-col gap-2">
        {right.map((player, i) => (
          <PlayerCard
            key={player.id}
            player={player}
            rank={ranked ? mid + i + 1 : undefined}
            onScore={onScore ? (pts) => onScore(player.id, pts) : undefined}
            onRemove={onRemove ? () => onRemove(player.id) : undefined}
            showScore={showScore}
          />
        ))}
      </div>
    </div>
  );
}
