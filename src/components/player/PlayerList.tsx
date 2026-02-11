import { useState, useEffect, useRef, useMemo } from 'react';
import { PlayerCard } from './PlayerCard';
import type { Player } from '../../lib/types';

interface PlayerListProps {
  players: Player[];
  ranked?: boolean;
  reverseScoring?: boolean;
  onRemove?: (id: string) => void;
  onScore?: (playerId: string, points: number) => void;
  showScore?: boolean;
}

export function PlayerList({
  players,
  ranked = false,
  reverseScoring = false,
  onRemove,
  onScore,
  showScore = true,
}: PlayerListProps) {
  const [stableIds, setStableIds] = useState<string[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Compute the ideal sort order based on current scores
  const idealIds = useMemo(() => {
    const list = ranked
      ? [...players].sort((a, b) =>
          reverseScoring ? a.score - b.score : b.score - a.score
        )
      : players;
    return list.map((p) => p.id);
  }, [players, ranked, reverseScoring]);

  const idealKey = idealIds.join(',');

  useEffect(() => {
    clearTimeout(debounceRef.current);

    // Update immediately if: not ranked, first render, or player set changed (add/remove)
    const idealSet = new Set(idealIds);
    const stableSet = new Set(stableIds);
    const setChanged =
      idealIds.length !== stableIds.length ||
      idealIds.some((id) => !stableSet.has(id)) ||
      stableIds.some((id) => !idealSet.has(id));

    if (!ranked || stableIds.length === 0 || setChanged) {
      setStableIds(idealIds);
      return;
    }

    // Same set of players, just different order → debounce the re-sort
    debounceRef.current = setTimeout(() => {
      setStableIds(idealIds);
    }, 2000);

    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idealKey, ranked]);

  // Build display list: stable order, but with fresh player data (latest scores)
  const sorted = useMemo(() => {
    if (stableIds.length === 0) {
      return ranked
        ? [...players].sort((a, b) =>
            reverseScoring ? a.score - b.score : b.score - a.score
          )
        : players;
    }
    const playerMap = new Map(players.map((p) => [p.id, p]));
    return stableIds
      .map((id) => playerMap.get(id))
      .filter((p): p is Player => p !== undefined);
  }, [players, stableIds, ranked, reverseScoring]);

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
