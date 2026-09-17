export const PULL_COST = 160;

export function toPulls(astrite: number): number {
  return Math.floor(astrite / PULL_COST);
}
