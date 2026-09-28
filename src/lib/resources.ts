import { prisma } from "@/lib/prisma";

export type ResourceAmounts = Record<number, number>;

export type ResourceDay = {
  date: Date;
  /** Amount of every item known on this day (carried forward from earlier days). */
  amounts: ResourceAmounts;
  /** Change vs. the previous day, only for items recorded this day; null on the very first day. */
  deltas: Record<number, number | null>;
};

/** Amounts as of the given day (inclusive), carrying forward the latest row per item. */
export async function getResourcesAsOf(date: Date): Promise<ResourceAmounts> {
  const rows = await prisma.resourceEntry.findMany({
    where: { date: { lte: date } },
    orderBy: { date: "asc" },
    select: { itemId: true, amount: true },
  });

  const amounts: ResourceAmounts = {};
  for (const row of rows) amounts[row.itemId] = row.amount;
  return amounts;
}

/** Days with at least one recorded change, newest first. */
export async function getResourceTimeline(limitDays: number): Promise<ResourceDay[]> {
  const rows = await prisma.resourceEntry.findMany({
    orderBy: { date: "asc" },
    select: { date: true, itemId: true, amount: true },
  });

  const days: ResourceDay[] = [];
  let carried: ResourceAmounts = {};

  for (const row of rows) {
    let day = days[days.length - 1];
    if (!day || day.date.getTime() !== row.date.getTime()) {
      day = { date: row.date, amounts: { ...carried }, deltas: {} };
      days.push(day);
    }

    const previous = carried[row.itemId];
    day.amounts[row.itemId] = row.amount;
    // An item first recorded after the first day was implicitly 0 before.
    const base = previous ?? (days.length > 1 ? 0 : undefined);
    day.deltas[row.itemId] = base === undefined ? null : row.amount - base;
    carried = day.amounts;
  }

  return days.reverse().slice(0, limitDays);
}
