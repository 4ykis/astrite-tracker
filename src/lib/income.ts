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

type Check = { date: Date; amount: number; createdAt: Date };
type Spend = { date: Date; amount: number; createdAt: Date };

/**
 * Balance check-ins in timeline order plus, per check-in, the spend it is the
 * first to reflect. A check-in is typed by hand, so it already contains every
 * pull logged before it was entered; a pull logged afterwards only shows up in
 * the next check-in. Attributing spend to that first reflecting check-in keeps
 * the balance drop and its spend in the same period, so they cancel out.
 * Spend no check-in reflects yet (logged after the latest one) is left out:
 * the balance has not dropped for it either.
 */
type Ledger = { balances: Check[]; spendAt: number[] };

function buildLedger(balances: Check[], spends: Spend[]): Ledger {
  const spendAt = balances.map(() => 0);
  for (const spend of spends) {
    let best = -1;
    balances.forEach((b, i) => {
      // A check-in backdated to before the spend's day cannot contain it.
      if (b.createdAt < spend.createdAt || b.date < spend.date) return;
      if (best === -1 || b.createdAt < balances[best].createdAt) best = i;
    });
    if (best !== -1) spendAt[best] += spend.amount;
  }
  return { balances, spendAt };
}

async function loadLedger(userId: string): Promise<Ledger> {
  const [balances, spends] = await Promise.all([
    prisma.balanceEntry.findMany({ where: { userId }, orderBy: [{ date: "asc" }, { createdAt: "asc" }] }),
    prisma.spendEntry.findMany({ where: { userId } }),
  ]);
  return buildLedger(balances, spends);
}

/** Index of the last check-in dated strictly before `date` (the balance carried into it), or -1. */
function lastIndexBefore(balances: Check[], date: Date): number {
  let result = -1;
  for (let i = 0; i < balances.length; i++) {
    if (balances[i].date.getTime() < date.getTime()) result = i;
    else break;
  }
  return result;
}

type Window = { balanceChange: number; earned: number };

/**
 * Astrite movement over the tracked days [start, end): from the balance
 * carried into `start` to the last check-in before `end`. Falls back to the
 * earliest check-in inside the range when there's none before `start` yet
 * (tracking started partway through), so in-progress periods still report
 * what is computable. `earned` adds back the spend reflected in between.
 */
function windowIncome({ balances, spendAt }: Ledger, start: Date, end: Date): Window | null {
  let startIdx = lastIndexBefore(balances, start);
  if (startIdx === -1) {
    startIdx = balances.findIndex((b) => b.date >= start && b.date < end);
    if (startIdx === -1) return null;
  }

  const endIdx = lastIndexBefore(balances, end);
  if (endIdx < startIdx) return null;

  let spent = 0;
  for (let i = startIdx + 1; i <= endIdx; i++) spent += spendAt[i];

  const balanceChange = balances[endIdx].amount - balances[startIdx].amount;
  return { balanceChange, earned: balanceChange + spent };
}

/**
 * Profit for a single tracked day: astrite earned between the balance carried
 * in from the day before and that day's closing check-in. Works the same
 * whether the day is closed (yesterday) or still in progress (today).
 */
function dayIncome(ledger: Ledger, day: Date): number | null {
  return windowIncome(ledger, day, addDays(day, 1))?.earned ?? null;
}

/**
 * income = astrite earned (balance change + spend reflected in it), net = the
 * raw balance change, spend = spend logged on days inside the bucket.
 */
export type IncomePoint = { label: string; income: number | null; net: number | null; spend: number };

export async function getIncomeSeries(userId: string, granularity: Granularity): Promise<IncomePoint[]> {
  const [ledger, spends] = await Promise.all([
    loadLedger(userId),
    prisma.spendEntry.findMany({ where: { userId }, select: { date: true, amount: true } }),
  ]);

  const buckets = buildBuckets(granularity, toDayStart(new Date()));

  return buckets.map((bucket) => {
    const spendSum = spends
      .filter((s) => s.date >= bucket.start && s.date < bucket.end)
      .reduce((sum, s) => sum + s.amount, 0);

    const window = windowIncome(ledger, bucket.start, bucket.end);

    return {
      label: bucket.label,
      income: window?.earned ?? null,
      net: window?.balanceChange ?? null,
      spend: spendSum,
    };
  });
}

/** Profit for yesterday (its own business day, 12:00 -> 11:59 next day), or null if not computable. */
export async function getYesterdayIncome(userId: string): Promise<number | null> {
  const ledger = await loadLedger(userId);
  return dayIncome(ledger, addDays(toDayStart(new Date()), -1));
}

/** Profit accrued so far today (its own business day, so far), or null if not computable. */
export async function getTodayIncome(userId: string): Promise<number | null> {
  const ledger = await loadLedger(userId);
  return dayIncome(ledger, toDayStart(new Date()));
}

export type IncomeRange = { income: number | null; avgPerDay: number | null; days: number };

export type IncomeSummary = { last7Days: IncomeRange; allTime: IncomeRange };

/** Profit (and average per day) over the last 7 days and over the whole tracked history. */
export async function getIncomeSummary(userId: string): Promise<IncomeSummary> {
  const ledger = await loadLedger(userId);
  const { balances, spendAt } = ledger;

  const today = toDayStart(new Date());
  const last7 = windowIncome(ledger, addDays(today, -6), addDays(today, 1));
  const last7Days: IncomeRange = {
    income: last7?.earned ?? null,
    avgPerDay: last7 ? last7.earned / 7 : null,
    days: 7,
  };

  let allTime: IncomeRange = { income: null, avgPerDay: null, days: 0 };
  if (balances.length >= 2) {
    const firstDate = balances[0].date;
    const lastDate = balances[balances.length - 1].date;
    const days = Math.max(1, Math.round((lastDate.getTime() - firstDate.getTime()) / 86_400_000));

    // All-time counts the balance you started tracking with too, instead of
    // treating it as an untracked baseline: everything ever held is the
    // latest balance plus everything spent that the check-ins reflect.
    const income = balances[balances.length - 1].amount + spendAt.reduce((sum, s) => sum + s, 0);
    allTime = { income, avgPerDay: income / days, days };
  }

  return { last7Days, allTime };
}
