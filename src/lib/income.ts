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

/**
 * Profit for a single tracked day: its own closing balance (the latest
 * check-in dated that day) against the balance carried in from the day
 * before. Self-contained — it never looks at the following day's data, so
 * this works the same whether the day is closed (yesterday) or still in
 * progress (today). Spend is tracked separately (see spending.ts); this is
 * the raw balance change only.
 */
function dayIncome(balances: { date: Date; amount: number }[], day: Date): number | null {
  const previousDay = addDays(day, -1);

  let startBalance = balanceAtOrBefore(balances, previousDay);

  if (startBalance === null) {
    const firstInDay = balances.find((b) => b.date.getTime() === day.getTime());
    if (!firstInDay) return null;
    startBalance = firstInDay.amount;
  }

  const endBalance = balanceAtOrBefore(balances, day);
  if (endBalance === null) return null;

  return endBalance - startBalance;
}

/**
 * Profit for [start, end): the raw balance change, falling back to the
 * earliest balance check-in inside the range when there's none before
 * `start` yet (e.g. tracking only started partway through the current
 * month/week) — this reports whatever partial profit is computable for the
 * period-so-far instead of nothing.
 */
function bucketIncome(
  balances: { date: Date; amount: number }[],
  start: Date,
  end: Date
): number | null {
  let startBalance = balanceAtOrBefore(balances, start);

  if (startBalance === null) {
    const firstInRange = balances.find((b) => b.date >= start && b.date < end);
    if (!firstInRange) return null;
    startBalance = firstInRange.amount;
  }

  const endBalance = balanceAtOrBefore(balances, end);
  if (endBalance === null) return null;

  return endBalance - startBalance;
}

export type IncomePoint = { label: string; income: number | null; spend: number };

/**
 * income(period) = (balance_end - balance_start) + sum(spend in period)
 * balance_start/end are the nearest recorded balance check-ins at the bucket
 * boundaries. When tracking only started partway through the bucket, income
 * falls back to whatever partial period is computable (see bucketIncome).
 */
export async function getIncomeSeries(granularity: Granularity): Promise<IncomePoint[]> {
  const [balances, spends] = await Promise.all([
    prisma.balanceEntry.findMany({ orderBy: [{ date: "asc" }, { createdAt: "asc" }] }),
    prisma.spendEntry.findMany({ orderBy: [{ date: "asc" }, { createdAt: "asc" }] }),
  ]);

  const buckets = buildBuckets(granularity, toDayStart(new Date()));

  return buckets.map((bucket) => {
    const spendSum = spends
      .filter((s) => s.date >= bucket.start && s.date < bucket.end)
      .reduce((sum, s) => sum + s.amount, 0);

    const income = bucketIncome(balances, bucket.start, bucket.end);

    return { label: bucket.label, income, spend: spendSum };
  });
}

/** Profit for yesterday (its own business day, 12:00 -> 11:59 next day), or null if not computable. */
export async function getYesterdayIncome(): Promise<number | null> {
  const balances = await prisma.balanceEntry.findMany({
    orderBy: [{ date: "asc" }, { createdAt: "asc" }],
  });

  const yesterday = addDays(toDayStart(new Date()), -1);
  return dayIncome(balances, yesterday);
}

/** Profit accrued so far today (its own business day, so far), or null if not computable. */
export async function getTodayIncome(): Promise<number | null> {
  const balances = await prisma.balanceEntry.findMany({
    orderBy: [{ date: "asc" }, { createdAt: "asc" }],
  });

  const today = toDayStart(new Date());
  return dayIncome(balances, today);
}

export type IncomeRange = { income: number | null; avgPerDay: number | null; days: number };

function computeRange(
  balances: { date: Date; amount: number }[],
  start: Date,
  end: Date,
  days: number
): IncomeRange {
  const income = bucketIncome(balances, start, end);
  if (income === null) {
    return { income: null, avgPerDay: null, days };
  }

  return { income, avgPerDay: days > 0 ? income / days : null, days };
}

export type IncomeSummary = { last7Days: IncomeRange; allTime: IncomeRange };

/** Profit (and average per day) over the last 7 days and over the whole tracked history. */
export async function getIncomeSummary(): Promise<IncomeSummary> {
  const balances = await prisma.balanceEntry.findMany({
    orderBy: [{ date: "asc" }, { createdAt: "asc" }],
  });

  const now = toDayStart(new Date());
  const last7Days = computeRange(balances, addDays(now, -7), now, 7);

  let allTime: IncomeRange = { income: null, avgPerDay: null, days: 0 };
  if (balances.length >= 2) {
    const firstDate = balances[0].date;
    const lastDate = balances[balances.length - 1].date;
    const days = Math.max(1, Math.round((lastDate.getTime() - firstDate.getTime()) / 86_400_000));
    allTime = computeRange(balances, firstDate, lastDate, days);
  }

  return { last7Days, allTime };
}
