/**
 * Resonators, echoes and sonata sets for the echo prefarm page, plus echo stat
 * tables. Data and icons come from scripts/fetch-echo-data.ts (+ fetch-stat-data.ts);
 * icons live in `public/icons/{characters,echoes,sonatas,weapons}/<id>.webp`.
 */
import charactersData from "./data/characters.json";
import echoesData from "./data/echoes.json";
import sonatasData from "./data/sonatas.json";
import weaponsData from "./data/weapons.json";

export type EchoCost = 1 | 3 | 4;

/** A percentage bonus: `stat` is a stat key from the tables below (e.g. "atk%", "crit-rate"). */
export type StatBonus = { stat: string; value: number };

/** `hp` / `atk` / `def` are base values at level 90; `forte` are the 8 minor forte nodes. */
export type Character = {
  id: number;
  name: string;
  rank: number;
  element: number;
  weaponType: number;
  hp: number;
  atk: number;
  def: number;
  forte: StatBonus[];
};
/** `atk` and `secondary` are level-90 values. */
export type Weapon = { id: number; name: string; rank: number; type: number; atk: number; secondary: StatBonus };
export type Echo = { id: number; name: string; cost: EchoCost; sonatas: number[] };
export type Sonata = { id: number; name: string };

export const CHARACTERS: Character[] = [...charactersData].sort(
  (a, b) => b.rank - a.rank || a.name.localeCompare(b.name),
);
export const ECHOES: Echo[] = (echoesData as Echo[])
  .slice()
  .sort((a, b) => b.cost - a.cost || a.name.localeCompare(b.name));
export const SONATAS: Sonata[] = sonatasData;
export const WEAPONS: Weapon[] = [...weaponsData].sort((a, b) => b.rank - a.rank || a.name.localeCompare(b.name));

export const CHARACTER_BY_ID = new Map(CHARACTERS.map((c) => [c.id, c]));
export const ECHO_BY_ID = new Map(ECHOES.map((e) => [e.id, e]));
export const SONATA_BY_ID = new Map(SONATAS.map((s) => [s.id, s]));
export const WEAPON_BY_ID = new Map(WEAPONS.map((w) => [w.id, w]));

export const characterIcon = (id: number) => `/icons/characters/${id}.webp`;
export const echoIcon = (id: number) => `/icons/echoes/${id}.webp`;
export const sonataIcon = (id: number) => `/icons/sonatas/${id}.webp`;
export const weaponIcon = (id: number) => `/icons/weapons/${id}.webp`;

/** Game weapon type ids (`Character.weaponType`, `Weapon.type`). */
export const WEAPON_TYPES: Record<number, string> = {
  1: "Broadblade",
  2: "Sword",
  3: "Pistols",
  4: "Gauntlets",
  5: "Rectifier",
};

export const COSTS: EchoCost[] = [4, 3, 1];

// Stats -------------------------------------------------------------------

export type StatUnit = "%" | "flat";

/** `min`–`max` is the roll range; for main stats `max` is the value at +25 and `min` is 0. */
export type Stat = {
  key: string;
  label: string;
  /** Compact label for the echo card. */
  short: string;
  min: number;
  max: number;
  unit: StatUnit;
  /** Range as text, e.g. "6.3–10.5%" (main stats: just the max). */
  hint: string;
};

const unitOf = (key: string): StatUnit => (["atk", "hp", "def"].includes(key) ? "flat" : "%");

export const formatStatValue = (value: number, unit: StatUnit) => `${value}${unit === "%" ? "%" : ""}`;

const stat = (key: string, label: string, min: number, max: number, short = label): Stat => {
  const unit = unitOf(key);
  const hint = min === 0 || min === max ? formatStatValue(max, unit) : `${min}–${formatStatValue(max, unit)}`;
  return { key, label, short, min, max, unit, hint };
};
const main = (key: string, label: string, max: number, short = label) => stat(key, label, 0, max, short);

/** The second main stat every echo gets for free, by cost (values at +25). */
export const FIXED_MAIN: Record<EchoCost, Stat> = {
  4: stat("atk", "ATK", 150, 150),
  3: stat("atk", "ATK", 100, 100),
  1: stat("hp", "HP", 2280, 2280),
};

const ELEMENTS = ["Glacio", "Fusion", "Electro", "Aero", "Spectro", "Havoc"];

/** Selectable main stats by cost (max values at +25). */
export const MAIN_STATS: Record<EchoCost, Stat[]> = {
  4: [
    main("crit-rate", "Crit Rate", 22),
    main("crit-dmg", "Crit DMG", 44),
    main("atk%", "ATK%", 33),
    main("hp%", "HP%", 33),
    main("def%", "DEF%", 41.8),
    main("healing", "Healing Bonus", 26.4, "Healing"),
  ],
  3: [
    main("atk%", "ATK%", 30),
    main("hp%", "HP%", 30),
    main("def%", "DEF%", 38),
    main("energy", "Energy Regen", 32, "Energy"),
    ...ELEMENTS.map((el) => main(`${el.toLowerCase()}-dmg`, `${el} DMG`, 30)),
  ],
  1: [main("atk%", "ATK%", 18), main("hp%", "HP%", 22.8), main("def%", "DEF%", 18)],
};

/** Sub stats with their roll range (min–max). */
export const SUB_STATS: Stat[] = [
  stat("crit-rate", "Crit Rate", 6.3, 10.5),
  stat("crit-dmg", "Crit DMG", 12.6, 21),
  stat("atk%", "ATK%", 6.4, 11.6),
  stat("atk", "ATK", 30, 60),
  stat("hp%", "HP%", 6.4, 11.6),
  stat("hp", "HP", 320, 580),
  stat("def%", "DEF%", 8.1, 14.7),
  stat("def", "DEF", 40, 70),
  stat("energy", "Energy Regen", 6.8, 12.4, "Energy"),
  stat("basic", "Basic Attack DMG", 6.4, 11.6, "Basic DMG"),
  stat("heavy", "Heavy Attack DMG", 6.4, 11.6, "Heavy DMG"),
  stat("skill", "Resonance Skill DMG", 6.4, 11.6, "Skill DMG"),
  stat("liberation", "Resonance Liberation DMG", 6.4, 11.6, "Lib. DMG"),
];

/** Every stat key with a readable label (echo stats plus forte-only ones). */
export const STAT_LABELS: Record<string, string> = Object.fromEntries(
  [...Object.values(MAIN_STATS).flat(), ...SUB_STATS].map((s) => [s.key, s.label]),
);

export const SUB_STAT_BY_KEY = new Map(SUB_STATS.map((s) => [s.key, s]));

export function mainStat(cost: EchoCost, key: string | null): Stat | undefined {
  return key ? MAIN_STATS[cost].find((s) => s.key === key) : undefined;
}

// Build shape stored in EchoBuild.slots -------------------------------------

export const SUB_COUNT = 5;
export const ECHO_COUNT = 5;

/**
 * `mainGot` / `subsGot` mark stats that are already rolled on the real echo;
 * `mainValue` / `subValues` hold the rolled number, kept only while that stat is set and marked.
 */
export type EchoSlot = {
  echoId: number | null;
  main: string | null;
  mainGot: boolean;
  mainValue: number | null;
  subs: (string | null)[];
  subsGot: boolean[];
  subValues: (number | null)[];
};

/** Sub stats pre-filled when an echo is put into an empty slot (the rest stay free). */
export const DEFAULT_SUBS = ["crit-rate", "crit-dmg", "atk%", "energy"];

/** Main stat pre-filled for a freshly chosen echo of this cost, if any. */
export const defaultMain = (cost: EchoCost): string | null => (cost === 1 ? "atk%" : null);

export const emptySlot = (): EchoSlot => ({
  echoId: null,
  main: null,
  mainGot: false,
  mainValue: null,
  subs: Array(SUB_COUNT).fill(null),
  subsGot: Array(SUB_COUNT).fill(false),
  subValues: Array(SUB_COUNT).fill(null),
});

/** Whether `value` is a number this stat can actually have. */
export const isValidStatValue = (stat: Stat, value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value >= stat.min && value <= stat.max;

const validValue = (stat: Stat | undefined, value: unknown) => (stat && isValidStatValue(stat, value) ? value : null);

/** Normalises whatever is stored in the DB into exactly ECHO_COUNT well-formed slots. */
export function normalizeSlots(raw: unknown): EchoSlot[] {
  const list = Array.isArray(raw) ? raw : [];
  return Array.from({ length: ECHO_COUNT }, (_, i) => {
    const slot = list[i] as Partial<EchoSlot> | undefined;
    const echo = typeof slot?.echoId === "number" ? ECHO_BY_ID.get(slot.echoId) : undefined;
    const mainDef = echo && typeof slot?.main === "string" ? mainStat(echo.cost, slot.main) : undefined;
    const main = mainDef?.key ?? null;
    const subs = Array.from({ length: SUB_COUNT }, (_, j) => {
      const key = Array.isArray(slot?.subs) ? slot.subs[j] : null;
      return typeof key === "string" && SUB_STAT_BY_KEY.has(key) ? key : null;
    });
    // Older rows have no got-flags; a flag only counts while its stat is set.
    const mainGot = main !== null && slot?.mainGot === true;
    const subsGot = subs.map((key, j) => key !== null && Array.isArray(slot?.subsGot) && slot.subsGot[j] === true);
    // Values are newer still; an out-of-range or non-numeric value is dropped.
    const mainValue = mainGot ? validValue(mainDef, slot?.mainValue) : null;
    const subValues = subs.map((key, j) =>
      subsGot[j] && key !== null && Array.isArray(slot?.subValues)
        ? validValue(SUB_STAT_BY_KEY.get(key), slot.subValues[j])
        : null,
    );
    return { echoId: echo?.id ?? null, main, mainGot, mainValue, subs, subsGot, subValues };
  });
}
