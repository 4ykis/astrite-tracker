/**
 * Writes src/lib/data/wuwa_targets.json: Prydwen's "recommended endgame stats" per resonator,
 * from the MIT mirror at github.com/TheInternetUse7/wuwa-character-build-db.
 * Lines that don't parse are printed as warnings; resonators without targets are skipped.
 * Run: npm run fetch:targets
 */
import { readFile, writeFile } from "node:fs/promises";
import { Target, TargetFile, TargetKey, Targets, targetSlug } from "../src/lib/targets";

const SOURCE = "https://raw.githubusercontent.com/TheInternetUse7/wuwa-character-build-db/main/data/";

type RawCharacter = { slug: string; name: string };

const ELEMENTS = "glacio|fusion|electro|aero|spectro|havoc";

function labelKey(label: string): TargetKey | undefined {
  const l = label.toLowerCase().replace(/\s+/g, " ").trim();
  if (l === "hp") return "hp";
  if (l === "def") return "def";
  if (l === "atk") return "atk";
  if (l === "crit rate") return "crit_rate";
  if (l === "crit dmg") return "crit_dmg";
  if (l === "energy regen") return "energy_regen";
  if (new RegExp(`^(${ELEMENTS}) dmg( ?%| bonus)$`).test(l)) return "element_dmg";
  return undefined;
}

const NUM = String.raw`(\d[\d,]*(?:\.\d+)?)`;
// "<label>[:] <num>[%][-<num>[%]][stray letter][+]<note>", e.g. "ATK: 1900-2200b+", "Energy Regen 116%-128%+…".
const LINE_RE = new RegExp(String.raw`^([A-Za-z][A-Za-z .%]*?)\s*:?\s*${NUM}\s*%?(?:\s*-\s*${NUM}\s*%?)?(?:[a-z](?=\+))?\+?([\s\S]*)$`);

const num = (s: string) => parseFloat(s.replace(/,/g, ""));

function parseLine(line: string): { key: TargetKey; target: Target } | undefined {
  const match = line.trim().match(LINE_RE);
  if (!match) return undefined;
  const [, label, low, high, rest] = match;
  const key = labelKey(label);
  if (!key) return undefined;
  const min = num(low);
  const max = high !== undefined ? num(high) : min;
  if (!Number.isFinite(min) || !Number.isFinite(max) || max < min) return undefined;
  // "(Before Set)" -> "Before Set"; glued notes ("260%This is…") stay as they are.
  const note = rest.trim().replace(/^\(([\s\S]*)\)$/, "$1").trim();
  return { key, target: note ? { min, max, note } : { min, max } };
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(SOURCE + path);
  if (!res.ok) throw new Error(`${res.status} for ${path}`);
  return res.json() as Promise<T>;
}

/** Fails the run if the parser drifts: Hiyuki's targets are known. */
function sanityCheck(file: TargetFile) {
  const expected: [TargetKey, number][] = [
    ["atk", 2200],
    ["crit_rate", 65],
    ["crit_dmg", 260],
    ["energy_regen", 120],
  ];
  const targets = file.heroes.hiyuki?.targets;
  for (const [key, max] of expected) {
    const got = targets?.[key]?.max;
    if (got !== max) throw new Error(`Sanity check: hiyuki ${key}.max is ${got}, expected ${max}`);
  }
}

async function main() {
  const { data } = await getJson<{ data: { characters: RawCharacter[] } }>("characters.json");
  const warnings: string[] = [];
  const skipped: string[] = [];
  const heroes: TargetFile["heroes"] = {};

  for (const { slug, name } of [...data.characters].sort((a, b) => a.slug.localeCompare(b.slug))) {
    const build = await getJson<{ data: { recommended_endgame_stats_target?: string[] } }>(`builds/${slug}.json`);
    const lines = build.data.recommended_endgame_stats_target ?? [];
    const targets: Targets = {};
    for (const line of lines) {
      const parsed = parseLine(line);
      if (!parsed) warnings.push(`${slug}: can't parse ${JSON.stringify(line)}`);
      else if (targets[parsed.key]) warnings.push(`${slug}: duplicate ${parsed.key} in ${JSON.stringify(line)}`);
      else targets[parsed.key] = parsed.target;
    }
    if (Object.keys(targets).length === 0) skipped.push(slug);
    else heroes[slug] = { name, targets };
  }

  const file: TargetFile = { heroes };
  sanityCheck(file);

  // Every app resonator should map onto a source slug (see SLUG_OVERRIDES in lib/targets.ts).
  const appCharacters: { name: string }[] = JSON.parse(
    await readFile(new URL("../src/lib/data/characters.json", import.meta.url), "utf8"),
  );
  const sourceSlugs = new Set(data.characters.map((c) => c.slug));
  for (const { name } of appCharacters) {
    if (!sourceSlugs.has(targetSlug(name))) warnings.push(`app character "${name}" has no source slug "${targetSlug(name)}"`);
  }

  await writeFile(new URL("../src/lib/data/wuwa_targets.json", import.meta.url), JSON.stringify(file, null, 2) + "\n");
  console.log(`${Object.keys(heroes).length} resonators with targets; skipped (no targets): ${skipped.join(", ") || "none"}`);
  for (const w of warnings) console.warn(`warning: ${w}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
