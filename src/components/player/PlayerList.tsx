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

  return (
    <div className="flex flex-col gap-2">
      {sorted.map((player, i) => (
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
  );
}
