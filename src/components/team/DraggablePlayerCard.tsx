import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { PlayerCard } from '../player/PlayerCard';
import type { Player } from '../../lib/types';

interface DraggablePlayerCardProps {
  player: Player;
  onScore?: (points: number) => void;
}

export function DraggablePlayerCard({ player, onScore }: DraggablePlayerCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: player.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.3 : 1,
      }}
    >
      <PlayerCard
        player={player}
        compact
        onScore={onScore}
        dragHandleProps={{ ...listeners, ...attributes }}
      />
    </div>
  );
}
