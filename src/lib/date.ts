/**
 * The app is single-user and tracks calendar days in the owner's local
 * timezone. Server runtimes (Vercel) default to UTC, which is several
 * hours behind Kyiv — without this, a save shortly after local midnight
 * would still fall on the *previous* UTC day.
 */
const APP_TIMEZONE = "Europe/Kyiv";

function getZonedYMD(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return { year: get("year"), month: get("month"), day: get("day") };
}

/** Normalizes a Date to the UTC-midnight marker for its APP_TIMEZONE calendar day. */
export function toDayStart(date: Date): Date {
  const { year, month, day } = getZonedYMD(date, APP_TIMEZONE);
  return new Date(Date.UTC(year, month - 1, day));
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

export function startOfWeek(date: Date): Date {
  const day = toDayStart(date);
  const weekday = (day.getUTCDay() + 6) % 7; // Monday = 0
  return addDays(day, -weekday);
}

export function startOfMonth(date: Date): Date {
  const { year, month } = getZonedYMD(date, APP_TIMEZONE);
  return new Date(Date.UTC(year, month - 1, 1));
}

export function addMonths(date: Date, months: number): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1));
}

export function startOfYear(date: Date): Date {
  const { year } = getZonedYMD(date, APP_TIMEZONE);
  return new Date(Date.UTC(year, 0, 1));
}

export function addYears(date: Date, years: number): Date {
  return new Date(Date.UTC(date.getUTCFullYear() + years, 0, 1));
}

export function formatDayLabel(date: Date): string {
  return date.toLocaleDateString("uk-UA", { day: "2-digit", month: "2-digit", timeZone: "UTC" });
}

export function formatMonthLabel(date: Date): string {
  return date.toLocaleDateString("uk-UA", { month: "short", year: "2-digit", timeZone: "UTC" });
}
