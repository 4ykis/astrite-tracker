import { prisma } from "@/lib/prisma";

export type CurrentBalance = {
  /** Astrite left: the last balance check-in minus what was logged as spent after it. */
  current: number;
  /** Astrite logged as spent (gacha buttons) after the last check-in, not in that number yet. */
  spentSince: number;
};

/**
 * The balance shown on the dashboard. A balance check-in is typed in by hand,
 * so pulls logged afterwards would leave it stale; subtract them here instead.
 * Spend logged *before* the latest check-in is already part of the number the
 * user typed, so only spend created after it counts. Income is unaffected —
 * it still reads raw check-ins only (see income.ts).
 */
export async function getCurrentBalance(userId: string): Promise<CurrentBalance | null> {
  const latest = await prisma.balanceEntry.findFirst({
    where: { userId },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });
  if (!latest) return null;

  const spent = await prisma.spendEntry.aggregate({
    _sum: { amount: true },
    where: { userId, createdAt: { gt: latest.createdAt } },
  });
  const spentSince = spent._sum.amount ?? 0;

  return { current: Math.max(0, latest.amount - spentSince), spentSince };
}
