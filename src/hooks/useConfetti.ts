import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { useGameStore } from '../store/useGameStore';

export function useConfetti() {
  const players = useGameStore((s) => s.players);
  const previousLeader = useGameStore((s) => s.previousLeader);
  const prevLeaderRef = useRef(previousLeader);

  useEffect(() => {
    if (players.length === 0) return;

    const sorted = [...players].sort((a, b) => b.score - a.score);
    const currentLeader = sorted[0];

    if (
      currentLeader &&
      currentLeader.score > 0 &&
      prevLeaderRef.current !== null &&
      currentLeader.id !== prevLeaderRef.current
    ) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: [currentLeader.color, '#FFD700', '#FFFFFF'],
      });
    }

    prevLeaderRef.current = currentLeader?.id ?? null;
    useGameStore.setState({ previousLeader: currentLeader?.id ?? null });
  }, [players]);
}
