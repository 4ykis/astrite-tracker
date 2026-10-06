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
/** `atk` and `secondary` are level-90 values; `passive` is the always-on stat from the passive at refinement 1. */
export type Weapon = {
  id: number;
  name: string;
  rank: number;
  type: number;
  atk: number;
  secondary: StatBonus;
  passive?: StatBonus;
};
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
/** `element` is `Character.element` (1–6). */
export const elementIcon = (element: number) => `/icons/elements/${element}.webp`;
/** Weapon type glyphs (`Weapon.type`), added by hand from the Wuthering Waves wiki: the game tables have none. */
export const weaponTypeIcon = (type: number) => `/icons/weapon-types/${type}.webp`;

/** Game weapon type ids (`Character.weaponType`, `Weapon.type`). */
export const WEAPON_TYPES: Record<number, string> = {
  1: "Broadblade",
  2: "Sword",
  3: "Pistols",
  4: "Gauntlets",
  5: "Rectifier",
};

export const COSTS: EchoCost[] = [4, 3, 1];

/** The weapon id if it exists and fits the character's weapon type, otherwise null. */
export function validWeaponId(characterId: number | null, weaponId: number | null): number | null {
  const weapon = weaponId !== null ? WEAPON_BY_ID.get(weaponId) : undefined;
  const character = characterId !== null ? CHARACTER_BY_ID.get(characterId) : undefined;
  return weapon && (!character || character.weaponType === weapon.type) ? weapon.id : null;
}

/** `EchoBuild.forteNodes`: bit i set = minor forte node `Character.forte[i]` is unlocked. */
export const FORTE_NODE_COUNT = 8;
export const FORTE_ALL = (1 << FORTE_NODE_COUNT) - 1;

export const validForteNodes = (mask: number) =>
  Number.isInteger(mask) && mask >= 0 && mask <= FORTE_ALL ? mask : FORTE_ALL;

export const isForteOn = (mask: number, index: number) => (mask & (1 << index)) !== 0;

export const forteCount = (mask: number) =>
  Array.from({ length: FORTE_NODE_COUNT }, (_, i) => i).filter((i) => isForteOn(mask, i)).length;

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

// The game truncates displayed stats (a 587.5 ATK weapon shows 587); the epsilon guards float noise.
const truncate = (value: number, decimals: number) => {
  const factor = 10 ** decimals;
  return Math.floor(value * factor + 1e-6) / factor;
};

/** Display format for computed stats: "2 140" for flat values, "54.3%" for percentages. */
export const formatFlat = (value: number) => truncate(value, 0).toLocaleString("uk-UA");
export const formatPercent = (value: number) => `${truncate(value, 1).toFixed(1)}%`;

const stat = (key: string, label: string, min: number, max: number, short = label): Stat => {
  const unit = unitOf(key);
  const hint = min === 0 || min === max ? formatStatValue(max, unit) : `${min}–${formatStatValue(max, unit)}`;
  return { key, label, short, min, max, unit, hint };
};
const main = (key: string, label: string, max: number, short = label) => stat(key, label, 0, max, short);

/** The second main stat every echo gets for free, by cost (max values at +25). */
export const FIXED_MAIN: Record<EchoCost, Stat> = {
  4: main("atk", "ATK", 150),
  3: main("atk", "ATK", 100),
  1: main("hp", "HP", 2280),
};

/** Element names; `Character.element` is the 1-based index into this list. */
export const ELEMENTS = ["Glacio", "Fusion", "Electro", "Aero", "Spectro", "Havoc"];
/** In-game element colours (`ElementColor` in the game's elementinfo.json), same order as ELEMENTS. */
export const ELEMENT_COLORS = ["#41AEFB", "#F0744E", "#B46BFF", "#55FFB5", "#F8E56C", "#E649A6"];

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
 * main stats (and the free FIXED_MAIN one) always count at their +25 value, so only `subValues`
 * hold a rolled number, kept only while that stat is set and marked;
 * `extras` are rolled sub stats outside the plan (e.g. flat HP), only for the computed stats.
 */
export type EchoSlot = {
  echoId: number | null;
  main: string | null;
  mainGot: boolean;
  subs: (string | null)[];
  subsGot: boolean[];
  subValues: (number | null)[];
  extras: ExtraSub[];
};

export type ExtraSub = { key: string; value: number | null };

/** Sub stats pre-filled when an echo is put into an empty slot (the rest stay free). */
export const DEFAULT_SUBS = ["crit-rate", "crit-dmg", "atk%", "energy"];

/** Main stat pre-filled for a freshly chosen echo of this cost, if any. */
export const defaultMain = (cost: EchoCost): string | null => (cost === 1 ? "atk%" : null);

export const emptySlot = (): EchoSlot => ({
  echoId: null,
  main: null,
  mainGot: false,
  subs: Array(SUB_COUNT).fill(null),
  subsGot: Array(SUB_COUNT).fill(false),
  subValues: Array(SUB_COUNT).fill(null),
  extras: [],
});

/**
 * Keeps `extras` consistent with the plan: known sub stats only, none repeated or already planned,
 * and no more than the game's SUB_COUNT rolled subs together with the checked planned ones.
 */
export function fitExtras(slot: EchoSlot): EchoSlot {
  const used = new Set(slot.subs.filter((key) => key !== null));
  const room = SUB_COUNT - slot.subsGot.filter(Boolean).length;
  const extras: ExtraSub[] = [];
  for (const extra of slot.extras) {
    const def = SUB_STAT_BY_KEY.get(extra.key);
    if (!def || used.has(extra.key) || extras.length >= room) continue;
    used.add(extra.key);
    extras.push({ key: extra.key, value: validValue(def, extra.value) });
  }
  return { ...slot, extras };
}

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
    // (Older rows also carry mainValue / fixedValue: main stats are fixed at +25 now, so they're dropped.)
    const subValues = subs.map((key, j) =>
      subsGot[j] && key !== null && Array.isArray(slot?.subValues)
        ? validValue(SUB_STAT_BY_KEY.get(key), slot.subValues[j])
        : null,
    );
    const extras = echo && Array.isArray(slot?.extras) ? (slot.extras as Partial<ExtraSub>[]) : [];
    return fitExtras({
      echoId: echo?.id ?? null,
      main,
      mainGot,
      subs,
      subsGot,
      subValues,
      extras: extras.map((e) => ({ key: String(e?.key), value: e?.value ?? null })),
    });
  });
}
