import { prisma } from "@/lib/prisma";
import {
  addDays,
  addMonths,
  addYears,
  formatDayLabel,
  formatMonthLabel,
  startOfMonth,
  startOfWeek,
  startOfYear,
  toDayStart,
} from "@/lib/date";

export type Granularity = "day" | "week" | "month" | "year";

type Bucket = { start: Date; end: Date; label: string };

const BUCKET_COUNTS: Record<Granularity, number> = {
  day: 14,
  week: 12,
  month: 12,
  year: 5,
};

function buildBuckets(granularity: Granularity, now: Date): Bucket[] {
  const count = BUCKET_COUNTS[granularity];
  const buckets: Bucket[] = [];

  for (let i = count - 1; i >= 0; i--) {
    let start: Date;
    let end: Date;
    let label: string;

    switch (granularity) {
      case "day":
        start = addDays(now, -i);
        end = addDays(start, 1);
        label = formatDayLabel(start);
        break;
      case "week":
        start = addDays(startOfWeek(now), -i * 7);
        end = addDays(start, 7);
        label = formatDayLabel(start);
        break;
      case "month":
        start = addMonths(startOfMonth(now), -i);
        end = addMonths(start, 1);
        label = formatMonthLabel(start);
        break;
      case "year":
        start = addYears(startOfYear(now), -i);
        end = addYears(start, 1);
        label = String(start.getUTCFullYear());
        break;
    }

    buckets.push({ start, end, label });
  }

  return buckets;
}

/** Finds the balance recorded at or before the given date (the nearest prior check-in). */
function balanceAtOrBefore(
  balances: { date: Date; amount: number }[],
  date: Date
): number | null {
  let result: number | null = null;
  for (const entry of balances) {
    if (entry.date.getTime() <= date.getTime()) {
      result = entry.amount;
    } else {
      break;
    }
  }
  return result;
}

export type IncomePoint = { label: string; income: number | null };

/**
 * income(period) = (balance_end - balance_start) + sum(spend in period)
 * balance_start/end are the nearest recorded balance check-ins at the bucket
 * boundaries; income is null when we don't have both boundary balances yet.
 */
export async function getIncomeSeries(granularity: Granularity): Promise<IncomePoint[]> {
  const [balances, spends] = await Promise.all([
    prisma.balanceEntry.findMany({ orderBy: { date: "asc" } }),
    prisma.spendEntry.findMany({ orderBy: { date: "asc" } }),
  ]);

  const buckets = buildBuckets(granularity, toDayStart(new Date()));

  return buckets.map((bucket) => {
    const startBalance = balanceAtOrBefore(balances, bucket.start);
    const endBalance = balanceAtOrBefore(balances, bucket.end);

    if (startBalance === null || endBalance === null) {
      return { label: bucket.label, income: null };
    }

    const spendSum = spends
      .filter((s) => s.date >= bucket.start && s.date < bucket.end)
      .reduce((sum, s) => sum + s.amount, 0);

    return { label: bucket.label, income: endBalance - startBalance + spendSum };
  });
}

/** Income for the single most recent full day (yesterday -> today), or null if not computable. */
export async function getYesterdayIncome(): Promise<number | null> {
  const balances = await prisma.balanceEntry.findMany({ orderBy: { date: "desc" }, take: 2 });
  if (balances.length < 2) return null;

  const [latest, previous] = balances;
  const spendSum = await prisma.spendEntry.aggregate({
    _sum: { amount: true },
    where: { date: { gte: previous.date, lt: latest.date } },
  });

  return latest.amount - previous.amount + (spendSum._sum.amount ?? 0);
}

export type IncomeRange = { income: number | null; avgPerDay: number | null; days: number };

function computeRange(
  balances: { date: Date; amount: number }[],
  spends: { date: Date; amount: number }[],
  start: Date,
  end: Date,
  days: number
): IncomeRange {
  const startBalance = balanceAtOrBefore(balances, start);
  const endBalance = balanceAtOrBefore(balances, end);

  if (startBalance === null || endBalance === null) {
    return { income: null, avgPerDay: null, days };
  }

  const spendSum = spends
    .filter((s) => s.date >= start && s.date < end)
    .reduce((sum, s) => sum + s.amount, 0);

  const income = endBalance - startBalance + spendSum;
  return { income, avgPerDay: days > 0 ? income / days : null, days };
}

export type IncomeSummary = { last7Days: IncomeRange; allTime: IncomeRange };

/** Income (and average per day) over the last 7 days and over the whole tracked history. */
export async function getIncomeSummary(): Promise<IncomeSummary> {
  const [balances, spends] = await Promise.all([
    prisma.balanceEntry.findMany({ orderBy: { date: "asc" } }),
    prisma.spendEntry.findMany({ orderBy: { date: "asc" } }),
  ]);

  const now = toDayStart(new Date());
  const last7Days = computeRange(balances, spends, addDays(now, -7), now, 7);

  let allTime: IncomeRange = { income: null, avgPerDay: null, days: 0 };
  if (balances.length >= 2) {
    const firstDate = balances[0].date;
    const lastDate = balances[balances.length - 1].date;
    const days = Math.max(1, Math.round((lastDate.getTime() - firstDate.getTime()) / 86_400_000));
    allTime = computeRange(balances, spends, firstDate, lastDate, days);
  }

  return { last7Days, allTime };
}
