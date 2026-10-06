/**
 * Adds level-90 base stats, weapon type and minor forte nodes to src/lib/data/characters.json
 * and writes src/lib/data/weapons.json (+ icons to public/icons/weapons/<id>.webp),
 * plus element icons for the picker filters (public/icons/elements/<element id>.webp).
 * Source: the game's own tables mirrored at github.com/Arikatsu/WutheringWaves_Data.
 * Runs at the end of fetch-echo-data.ts; standalone: npx tsx scripts/fetch-stat-data.ts
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const GAME_DATA = "https://raw.githubusercontent.com/Arikatsu/WutheringWaves_Data/3.7/";
const CDN = "https://static.nanoka.cc/assets/ww/";
const MAX_LEVEL = 90;
const MAX_BREACH = 6;

type Prop = { Id: number; Value: number; IsRatio: boolean };
type RawRole = { Id: number; PropertyId: number; SkillTreeGroupId: number; WeaponType: number };
type RawBaseProperty = {
  Id: number;
  Lv: number;
  LifeMax: number;
  Atk: number;
  Def: number;
  Crit: number;
  CritDamage: number;
  EnergyEfficiency: number;
};
type RawRoleGrowth = { Level: number; BreachLevel: number; LifeMaxRatio: number; AtkRatio: number; DefRatio: number };
type RawWeaponGrowth = { CurveId: number; Level: number; BreachLevel: number; CurveValue: number };
type RawSkillNode = { NodeGroup: number; NodeIndex: number; NodeType: number; Property: Prop[] };
type RawWeapon = {
  ItemId: number;
  WeaponName: string;
  QualityId: number;
  WeaponType: number;
  FirstPropId: Prop;
  FirstCurve: number;
  SecondPropId: Prop;
  SecondCurve: number;
  Desc: string;
  DescParams: { ArrayString: string[] }[];
  // The CDN only mirrors the base "Icon" size, not IconMiddle/IconSmall/IconBig.
  Icon: string;
};
type RawText = { Id: string; Content: string };
type RawElement = { Id: number; Icon3: string };

/** Game property id -> stat key used in lib/echoes.ts (all of these are percentages). */
const STAT_BY_PROPERTY: Record<number, string> = {
  8: "crit-rate",
  9: "crit-dmg",
  11: "energy",
  35: "healing",
  22: "glacio-dmg",
  23: "fusion-dmg",
  24: "electro-dmg",
  25: "aero-dmg",
  26: "spectro-dmg",
  27: "havoc-dmg",
  10002: "hp%",
  10007: "atk%",
  10010: "def%",
};

/** Passive wording -> stat key, for passives whose first sentence is an unconditional stat bonus. */
const PASSIVE_STAT: Record<string, string> = {
  ATK: "atk%",
  HP: "hp%",
  "Max HP": "hp%",
  DEF: "def%",
  "Energy Regen": "energy",
  "Crit. Rate": "crit-rate",
};
const PASSIVE_RE = /^(?:Increases?|Increase) (ATK|Max HP|HP|DEF|Energy Regen|Crit\. Rate) by \{0\}\.|^(ATK|Max HP|HP|DEF) (?:is )?increased by \{0\}\./;

/** The always-on stat bonus at the start of a weapon passive (refinement 1), e.g. "Increases ATK by 12%." */
function passiveStat(w: RawWeapon, text: Map<string, string>) {
  const match = text.get(w.Desc)?.match(PASSIVE_RE);
  if (!match) return undefined;
  const value = parseFloat(w.DescParams[0]?.ArrayString[0] ?? "");
  if (!Number.isFinite(value)) throw new Error(`Weapon ${w.ItemId} passive has no value`);
  return { stat: PASSIVE_STAT[match[1] ?? match[2]], value };
}

/** Node type of the minor (stat) forte nodes in skilltree.json. */
const STAT_NODE = 4;

const round = (value: number) => Math.round(value * 1000) / 1000;

/** A stat bonus in percent: ratio props are fractions, the rest are basis points. */
function percentStat(prop: Prop, scale = 1) {
  const stat = STAT_BY_PROPERTY[prop.Id];
  if (!stat) throw new Error(`Unknown property id ${prop.Id}`);
  return { stat, value: round((prop.IsRatio ? prop.Value * 100 : prop.Value / 100) * scale) };
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(GAME_DATA + path);
  if (!res.ok) throw new Error(`${res.status} for ${path}`);
  return res.json();
}

// "/Game/Aki/UI/UIResources/.../T_Foo.T_Foo" -> "UIResources/.../T_Foo.webp"
function iconPath(gamePath: string): string {
  return gamePath.replace(/^\/Game\/Aki\/UI\//, "").replace(/\.[^./]+$/, ".webp");
}

export async function fetchStatData() {
  const [roles, baseProps, roleGrowth, weaponGrowth, skillTree, rawWeapons, texts, elements] = await Promise.all([
    getJson<RawRole[]>("BinData/role/roleinfo.json"),
    getJson<RawBaseProperty[]>("BinData/property/baseproperty.json"),
    getJson<RawRoleGrowth[]>("BinData/property/rolepropertygrowth.json"),
    getJson<RawWeaponGrowth[]>("BinData/property/weaponpropertygrowth.json"),
    getJson<RawSkillNode[]>("BinData/skillTree/skilltree.json"),
    getJson<RawWeapon[]>("BinData/weapon/weaponconf.json"),
    getJson<RawText[]>("Textmaps/en/multi_text/MultiText.json"),
    getJson<RawElement[]>("BinData/element_info/elementinfo.json"),
  ]);

  const isMax = (row: { Level: number; BreachLevel: number }) => row.Level === MAX_LEVEL && row.BreachLevel === MAX_BREACH;
  const growth = roleGrowth.find(isMax);
  if (!growth) throw new Error("No level-90 role growth row");
  const curve = (id: number) => {
    const row = weaponGrowth.find((g) => g.CurveId === id && isMax(g));
    if (!row) throw new Error(`No level-90 row for weapon curve ${id}`);
    return row.CurveValue / 10000;
  };

  const dataDir = new URL("../src/lib/data/", import.meta.url);
  const charactersFile = new URL("characters.json", dataDir);
  const characters: { id: number }[] = JSON.parse(await readFile(charactersFile, "utf8"));

  const withStats = characters.map((c) => {
    const role = roles.find((r) => r.Id === c.id);
    if (!role) throw new Error(`No roleinfo for character ${c.id}`);
    const base = baseProps.find((b) => b.Id === role.PropertyId && b.Lv === 1);
    if (!base) throw new Error(`No base property for character ${c.id}`);
    // computeStats() assumes the usual 5% / 150% / 100% for everyone.
    if (base.Crit !== 500 || base.CritDamage !== 15000 || base.EnergyEfficiency !== 10000) {
      throw new Error(`Character ${c.id} has unusual base crit/energy`);
    }
    const forte = skillTree
      .filter((n) => n.NodeGroup === role.SkillTreeGroupId && n.NodeType === STAT_NODE)
      .sort((a, b) => a.NodeIndex - b.NodeIndex)
      .flatMap((n) => n.Property.map((p) => percentStat(p)));
    if (forte.length !== 8) throw new Error(`Character ${c.id} has ${forte.length} forte stat nodes`);

    return {
      ...c,
      weaponType: role.WeaponType,
      hp: round((base.LifeMax * growth.LifeMaxRatio) / 10000),
      atk: round((base.Atk * growth.AtkRatio) / 10000),
      def: round((base.Def * growth.DefRatio) / 10000),
      forte,
    };
  });
  await writeFile(charactersFile, JSON.stringify(withStats, null, 2) + "\n");

  const text = new Map(texts.map((t) => [t.Id, t.Content]));
  const weapons = rawWeapons
    .filter((w) => text.get(w.WeaponName))
    .map((w) => ({
      id: w.ItemId,
      name: text.get(w.WeaponName)!,
      rank: w.QualityId,
      type: w.WeaponType,
      atk: round(w.FirstPropId.Value * curve(w.FirstCurve)),
      secondary: percentStat(w.SecondPropId, curve(w.SecondCurve)),
      passive: passiveStat(w, text),
      icon: w.Icon,
    }));

  const iconDir = new URL("../public/icons/weapons/", import.meta.url);
  await mkdir(iconDir, { recursive: true });
  for (const w of weapons) {
    // Icons are optional: the UI falls back to the weapon's initials.
    const res = await fetch(CDN + iconPath(w.icon)).catch(() => null);
    if (res?.ok) await writeFile(new URL(`${w.id}.webp`, iconDir), Buffer.from(await res.arrayBuffer()));
    console.log(`${res?.ok ? "✓" : "✗ (no icon)"} weapons/${w.id} ${w.name}`);
  }
  const trimmed = weapons.map((w) => ({ ...w, icon: undefined }));
  await writeFile(new URL("weapons.json", dataDir), JSON.stringify(trimmed, null, 2) + "\n");
  console.log(`✓ stats for ${withStats.length} characters, ${weapons.length} weapons`);

  // White 128px glyphs; ids 1–6 match Character.element (0 is "no element").
  const elementDir = new URL("../public/icons/elements/", import.meta.url);
  await mkdir(elementDir, { recursive: true });
  for (const e of elements.filter((e) => e.Id >= 1 && e.Id <= 6)) {
    const res = await fetch(CDN + iconPath(e.Icon3));
    if (!res.ok) throw new Error(`${res.status} for element icon ${e.Id}`);
    await writeFile(new URL(`${e.Id}.webp`, elementDir), Buffer.from(await res.arrayBuffer()));
    console.log(`✓ elements/${e.Id}`);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  fetchStatData().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
