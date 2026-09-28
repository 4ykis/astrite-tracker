/**
 * Weapon & skill (forte) development materials. Every series has 4 rarities
 * (LF → FF); item ids are the in-game ids, and the last digit is the tier.
 * Icons live in `public/materials/<id>.webp` (see scripts/fetch-material-icons.ts).
 */

export type MaterialGroup = "enemy" | "forgery";
export type Tier = 1 | 2 | 3 | 4;

export type Material = { id: number; name: string; tier: Tier; icon: string };

export type Series = {
  key: string;
  name: string;
  group: MaterialGroup;
  items: [Material, Material, Material, Material];
};

function series(
  key: string,
  name: string,
  group: MaterialGroup,
  baseId: number,
  names: [string, string, string, string],
): Series {
  const items = names.map((itemName, index) => {
    const id = baseId + index + 1;
    return { id, name: itemName, tier: (index + 1) as Tier, icon: `/materials/${id}.webp` };
  }) as Series["items"];
  return { key, name, group, items };
}

const freq = (suffix: string): [string, string, string, string] => [
  `LF ${suffix}`,
  `MF ${suffix}`,
  `HF ${suffix}`,
  `FF ${suffix}`,
];

export const SERIES: Series[] = [
  // Enemy drops — used for ascension, forte and weapons.
  series("whisperin", "Whisperin Core", "enemy", 41100010, freq("Whisperin Core")),
  series("howler", "Howler Core", "enemy", 41100020, freq("Howler Core")),
  series("ring", "Ring", "enemy", 41100030, ["Crude Ring", "Basic Ring", "Improved Ring", "Tailored Ring"]),
  series("polygon", "Polygon Core", "enemy", 41100040, freq("Polygon Core")),
  series("tidal", "Tidal Residuum", "enemy", 41100050, freq("Tidal Residuum")),
  series("exoswarm-core", "Exoswarm Core", "enemy", 41100060, freq("Exoswarm Core")),
  series("mech", "Mech Core", "enemy", 41100070, freq("Mech Core")),
  series("exoswarm-pendant", "Exoswarm Pendant", "enemy", 41100080, [
    "Fractured Exoswarm Pendant",
    "Worn Exoswarm Pendant",
    "Chipped Exoswarm Pendant",
    "Intact Exoswarm Pendant",
  ]),
  series("autopuppet", "Autopuppet Kernel", "enemy", 41100090, freq("Autopuppet Kernel")),
  series("mask", "Mask", "enemy", 41200030, [
    "Mask of Constraint",
    "Mask of Erosion",
    "Mask of Distortion",
    "Mask of Insanity",
  ]),

  // Forgery Challenge drops — used for forte and weapons.
  series("metallic-drip", "Metallic Drip", "forgery", 43020010, [
    "Inert Metallic Drip",
    "Reactive Metallic Drip",
    "Polarized Metallic Drip",
    "Heterized Metallic Drip",
  ]),
  series("phlogiston", "Phlogiston", "forgery", 43020020, [
    "Impure Phlogiston",
    "Extracted Phlogiston",
    "Refined Phlogiston",
    "Flawless Phlogiston",
  ]),
  series("helix", "Helix", "forgery", 43020030, ["Lento Helix", "Adagio Helix", "Andante Helix", "Presto Helix"]),
  series("waveworn-residue", "Waveworn Residue", "forgery", 43020040, [
    "Waveworn Residue 210",
    "Waveworn Residue 226",
    "Waveworn Residue 235",
    "Waveworn Residue 239",
  ]),
  series("cadence", "Cadence", "forgery", 43020050, ["Cadence Seed", "Cadence Bud", "Cadence Leaf", "Cadence Blossom"]),
  series("polarizer", "Polarizer", "forgery", 43021010, [
    "Broken Wing Polarizer",
    "Monowing Polarizer",
    "Polywing Polarizer",
    "Layered Wing Polarizer",
  ]),
  series("combustor", "Combustor", "forgery", 43021020, [
    "Incomplete Combustor",
    "Aftertune Combustor",
    "Remnant Combustor",
    "Reverb Combustor",
  ]),
  series("string", "String", "forgery", 43021030, [
    "Spliced String",
    "Broken String",
    "Solidified String",
    "Melodic String",
  ]),
  series("carved-crystal", "Carved Crystal", "forgery", 43021040, freq("Carved Crystal")),
  series("waveworn-shard", "Waveworn Shard", "forgery", 43021050, freq("Waveworn Shard")),
];

export const GROUP_LABELS: Record<MaterialGroup, string> = {
  enemy: "Звичайні (з ворогів)",
  forgery: "Кузня (Forgery)",
};

export const ALL_MATERIALS: (Material & { group: MaterialGroup })[] = SERIES.flatMap((s) =>
  s.items.map((item) => ({ ...item, group: s.group })),
);

// In-game rarity colours: LF green, MF blue, HF purple, FF gold.
export const TIER_STYLES: Record<Tier, { border: string; bg: string; text: string }> = {
  1: { border: "border-emerald-500", bg: "bg-emerald-500/15", text: "text-emerald-300" },
  2: { border: "border-sky-500", bg: "bg-sky-500/15", text: "text-sky-300" },
  3: { border: "border-violet-500", bg: "bg-violet-500/15", text: "text-violet-300" },
  4: { border: "border-amber-400", bg: "bg-amber-400/15", text: "text-amber-300" },
};
