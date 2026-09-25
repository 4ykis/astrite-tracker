import { prisma } from "@/lib/prisma";
import { addDays, toDayStart } from "@/lib/date";

async function spendBetween(start: Date, end: Date): Promise<number> {
  const result = await prisma.spendEntry.aggregate({
    _sum: { amount: true },
    where: { date: { gte: start, lt: end } },
  });
  return result._sum.amount ?? 0;
}

/** Astrite spent yesterday (its own business day, 12:00 -> 11:59 next day). */
export async function getYesterdaySpend(): Promise<number> {
  const today = toDayStart(new Date());
  return spendBetween(addDays(today, -1), today);
}

/** Astrite spent so far today (its own business day, so far). */
export async function getTodaySpend(): Promise<number> {
  const today = toDayStart(new Date());
  return spendBetween(today, addDays(today, 1));
}

export type SpendRange = { amount: number; avgPerDay: number | null; days: number };
export type SpendSummary = { last7Days: SpendRange; allTime: SpendRange };

/**
 * Spend (and average per day) over the last 7 days and over the whole
 * tracked history. `allTimeDays` should match IncomeSummary.allTime.days so
 * both blocks report over the same span.
 */
export async function getSpendSummary(allTimeDays: number): Promise<SpendSummary> {
  const now = toDayStart(new Date());

  const [last7DaysAmount, allTimeAmount] = await Promise.all([
    spendBetween(addDays(now, -7), now),
    prisma.spendEntry.aggregate({ _sum: { amount: true } }).then((r) => r._sum.amount ?? 0),
  ]);

  return {
    last7Days: { amount: last7DaysAmount, avgPerDay: last7DaysAmount / 7, days: 7 },
    allTime: {
      amount: allTimeAmount,
      avgPerDay: allTimeDays > 0 ? allTimeAmount / allTimeDays : null,
      days: allTimeDays,
    },
  };
}
