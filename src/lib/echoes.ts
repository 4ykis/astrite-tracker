/**
 * Resonators, echoes and sonata sets for the echo prefarm page, plus echo stat
 * tables. Data and icons come from scripts/fetch-echo-data.ts; icons live in
 * `public/icons/{characters,echoes,sonatas}/<id>.webp`.
 */
import charactersData from "./data/characters.json";
import echoesData from "./data/echoes.json";
import sonatasData from "./data/sonatas.json";

export type EchoCost = 1 | 3 | 4;

export type Character = { id: number; name: string; rank: number; element: number };
export type Echo = { id: number; name: string; cost: EchoCost; sonatas: number[] };
export type Sonata = { id: number; name: string };

export const CHARACTERS: Character[] = [...charactersData].sort(
  (a, b) => b.rank - a.rank || a.name.localeCompare(b.name),
);
export const ECHOES: Echo[] = (echoesData as Echo[])
  .slice()
  .sort((a, b) => b.cost - a.cost || a.name.localeCompare(b.name));
export const SONATAS: Sonata[] = sonatasData;

export const CHARACTER_BY_ID = new Map(CHARACTERS.map((c) => [c.id, c]));
export const ECHO_BY_ID = new Map(ECHOES.map((e) => [e.id, e]));
export const SONATA_BY_ID = new Map(SONATAS.map((s) => [s.id, s]));

export const characterIcon = (id: number) => `/icons/characters/${id}.webp`;
export const echoIcon = (id: number) => `/icons/echoes/${id}.webp`;
export const sonataIcon = (id: number) => `/icons/sonatas/${id}.webp`;

export const COSTS: EchoCost[] = [4, 3, 1];

// Stats -------------------------------------------------------------------

export type Stat = { key: string; label: string; hint: string; /** Compact label for the echo card. */ short: string };

const stat = (key: string, label: string, hint: string, short = label): Stat => ({ key, label, hint, short });

/** The second main stat every echo gets for free, by cost (values at +25). */
export const FIXED_MAIN: Record<EchoCost, Stat> = {
  4: stat("atk", "ATK", "150"),
  3: stat("atk", "ATK", "100"),
  1: stat("hp", "HP", "2280"),
};

const ELEMENTS = ["Glacio", "Fusion", "Electro", "Aero", "Spectro", "Havoc"];

/** Selectable main stats by cost (max values at +25). */
export const MAIN_STATS: Record<EchoCost, Stat[]> = {
  4: [
    stat("crit-rate", "Crit Rate", "22%"),
    stat("crit-dmg", "Crit DMG", "44%"),
    stat("atk%", "ATK%", "33%"),
    stat("hp%", "HP%", "33%"),
    stat("def%", "DEF%", "41.8%"),
    stat("healing", "Healing Bonus", "26.4%", "Healing"),
  ],
  3: [
    stat("atk%", "ATK%", "30%"),
    stat("hp%", "HP%", "30%"),
    stat("def%", "DEF%", "38%"),
    stat("energy", "Energy Regen", "32%", "Energy"),
    ...ELEMENTS.map((el) => stat(`${el.toLowerCase()}-dmg`, `${el} DMG`, "30%")),
  ],
  1: [stat("atk%", "ATK%", "18%"), stat("hp%", "HP%", "22.8%"), stat("def%", "DEF%", "18%")],
};

/** Sub stats with their roll range (min–max). */
export const SUB_STATS: Stat[] = [
  stat("crit-rate", "Crit Rate", "6.3–10.5%"),
  stat("crit-dmg", "Crit DMG", "12.6–21%"),
  stat("atk%", "ATK%", "6.4–11.6%"),
  stat("atk", "ATK", "30–60"),
  stat("hp%", "HP%", "6.4–11.6%"),
  stat("hp", "HP", "320–580"),
  stat("def%", "DEF%", "8.1–14.7%"),
  stat("def", "DEF", "40–70"),
  stat("energy", "Energy Regen", "6.8–12.4%", "Energy"),
  stat("basic", "Basic Attack DMG", "6.4–11.6%", "Basic DMG"),
  stat("heavy", "Heavy Attack DMG", "6.4–11.6%", "Heavy DMG"),
  stat("skill", "Resonance Skill DMG", "6.4–11.6%", "Skill DMG"),
  stat("liberation", "Resonance Liberation DMG", "6.4–11.6%", "Lib. DMG"),
];

export const SUB_STAT_BY_KEY = new Map(SUB_STATS.map((s) => [s.key, s]));

export function mainStat(cost: EchoCost, key: string | null): Stat | undefined {
  return key ? MAIN_STATS[cost].find((s) => s.key === key) : undefined;
}

// Build shape stored in EchoBuild.slots -------------------------------------

export const SUB_COUNT = 5;
export const ECHO_COUNT = 5;

/** `mainGot` / `subsGot` mark stats that are already rolled on the real echo. */
export type EchoSlot = {
  echoId: number | null;
  main: string | null;
  mainGot: boolean;
  subs: (string | null)[];
  subsGot: boolean[];
};

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
});

/** Normalises whatever is stored in the DB into exactly ECHO_COUNT well-formed slots. */
export function normalizeSlots(raw: unknown): EchoSlot[] {
  const list = Array.isArray(raw) ? raw : [];
  return Array.from({ length: ECHO_COUNT }, (_, i) => {
    const slot = list[i] as Partial<EchoSlot> | undefined;
    const echo = typeof slot?.echoId === "number" ? ECHO_BY_ID.get(slot.echoId) : undefined;
    const main = echo && typeof slot?.main === "string" && mainStat(echo.cost, slot.main) ? slot.main : null;
    const subs = Array.from({ length: SUB_COUNT }, (_, j) => {
      const key = Array.isArray(slot?.subs) ? slot.subs[j] : null;
      return typeof key === "string" && SUB_STAT_BY_KEY.has(key) ? key : null;
    });
    // Older rows have no got-flags; a flag only counts while its stat is set.
    const mainGot = main !== null && slot?.mainGot === true;
    const subsGot = subs.map((key, j) => key !== null && Array.isArray(slot?.subsGot) && slot.subsGot[j] === true);
    return { echoId: echo?.id ?? null, main, mainGot, subs, subsGot };
  });
}
