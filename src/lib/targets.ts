/**
 * Endgame stat targets (Prydwen, via scripts/fetch-targets.ts) compared with a build's stats.
 * Pure: no data or UI imports, so the script and node:test can load it directly.
 */

export const TARGET_KEYS = ["hp", "def", "atk", "crit_rate", "crit_dmg", "energy_regen", "element_dmg"] as const;
export type TargetKey = (typeof TARGET_KEYS)[number];

export type Target = { min: number; max: number; note?: string };
export type Targets = Partial<Record<TargetKey, Target>>;
export type TargetFile = { heroes: Record<string, { name: string; targets: Targets }> };

/** Stats that decide the header colour; HP, DEF and element DMG are only shown. */
export const STATUS_KEYS: TargetKey[] = ["atk", "crit_rate", "crit_dmg", "energy_regen"];
/** Average of min(current / recommended, 1) over STATUS_KEYS. */
export const GREEN_FROM = 1.0;
export const YELLOW_FROM = 0.9;

export type TargetStatus = "green" | "yellow" | "red" | "none";

/**
 * Header border colour, continuous over the average gap below the targets (1 - average ratio):
 * green at 0, yellow at YELLOW_AT, red from RED_AT on. HUE_EASING > 1 keeps small gaps
 * (a few percent) close to green; 1 is linear.
 */
export const YELLOW_AT = 0.1;
export const RED_AT = 0.2;
export const HUE_EASING = 1.5;

// [hue, saturation %, lightness %] of the theme's green #3fb950, yellow #d29922 and red #f85149.
type Hsl = [number, number, number];
const GREEN: Hsl = [128, 49, 49];
const YELLOW: Hsl = [40, 72, 48];
const RED: Hsl = [3, 92, 63];

export function targetColor(average: number): string {
  const gap = Math.max(0, 1 - average);
  const [from, to, t] =
    gap <= YELLOW_AT
      ? [GREEN, YELLOW, (gap / YELLOW_AT) ** HUE_EASING]
      : [YELLOW, RED, Math.min((gap - YELLOW_AT) / (RED_AT - YELLOW_AT), 1)];
  const [h, s, l] = from.map((v, i) => Math.round(v + (to[i] - v) * t));
  return `hsl(${h} ${s}% ${l}%)`;
}

export type TargetRow = {
  key: TargetKey;
  /** Rounded the way the game shows it: flat stats to an integer, percentages to 0.1. */
  value: number;
  /** The recommended (max) value, only while `value` is below it — what goes in the brackets. */
  rec: number | null;
  /** min(value / recommended, 1); null without a target. */
  ratio: number | null;
  note?: string;
};

const FLAT_KEYS = new Set<TargetKey>(["hp", "def", "atk"]);

export const roundStat = (key: TargetKey, value: number) =>
  FLAT_KEYS.has(key) ? Math.round(value) : Math.round(value * 10) / 10;

// Averages like 0.9 come out as 0.8999… in floating point.
const EPSILON = 1e-9;

export function compare(
  current: Partial<Record<TargetKey, number>>,
  targets: Targets | undefined,
): { rows: TargetRow[]; status: TargetStatus; average: number | null } {
  const rows: TargetRow[] = [];
  for (const key of TARGET_KEYS) {
    const raw = current[key];
    if (raw === undefined) continue;
    const value = roundStat(key, raw);
    const target = targets?.[key];
    if (!target) {
      rows.push({ key, value, rec: null, ratio: null });
      continue;
    }
    const rec = roundStat(key, target.max);
    rows.push({
      key,
      value,
      rec: value < rec ? rec : null,
      ratio: rec > 0 ? Math.min(value / rec, 1) : 1,
      note: target.note,
    });
  }

  const ratios = rows.flatMap((row) => (STATUS_KEYS.includes(row.key) && row.ratio !== null ? [row.ratio] : []));
  if (ratios.length === 0) return { rows, status: "none", average: null };
  const average = ratios.reduce((sum, r) => sum + r, 0) / ratios.length;
  const status = average >= GREEN_FROM - EPSILON ? "green" : average >= YELLOW_FROM - EPSILON ? "yellow" : "red";
  return { rows, status, average };
}

/** Source slugs that don't follow from the app's character name. */
const SLUG_OVERRIDES: Record<string, string> = {
  Shorekeeper: "the-shorekeeper",
};

/** App character name -> source slug: "Rover: Aero" -> "rover-aero", "Xiangli Yao" -> "xiangli-yao". */
export const targetSlug = (name: string) =>
  SLUG_OVERRIDES[name] ??
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
