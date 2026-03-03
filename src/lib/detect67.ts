export function has67InScore(score: number): boolean {
  return String(Math.abs(score)).includes('67');
}

export function is67RankPair(rank: number): boolean {
  return rank === 6 || rank === 7;
}
