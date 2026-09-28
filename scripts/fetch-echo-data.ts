/**
 * Downloads resonator / echo / sonata data and icons for the echo prefarm page.
 * Writes trimmed JSON to src/lib/data/ and icons to public/icons/{characters,echoes,sonatas}/<id>.webp.
 * Run: npx tsx scripts/fetch-echo-data.ts
 */
import { mkdir, writeFile } from "node:fs/promises";

const VERSION = "3.7.3";
const DATA = `https://static.nanoka.cc/ww/${VERSION}/`;
const CDN = "https://static.nanoka.cc/assets/ww/";

type RawCharacter = { icon: string; rank: number; element: number; en: string };
type RawEcho = { icon: string; intensity: number; group: number[]; en: string };
type RawSonata = { id: number; icon: string; name: { en: string } };

// "/Game/Aki/UI/UIResources/.../T_Foo.T_Foo" -> "UIResources/.../T_Foo.webp"
function iconPath(gamePath: string): string {
  return gamePath.replace(/^\/Game\/Aki\/UI\//, "").replace(/\.[^./]+$/, ".webp");
}

// Echo "intensity": 0 common, 1 elite, 2 overlord, 3 calamity.
const COST_BY_INTENSITY: Record<number, 1 | 3 | 4> = { 0: 1, 1: 3, 2: 4, 3: 4 };

async function getJson<T>(name: string): Promise<Record<string, T>> {
  const res = await fetch(DATA + name);
  if (!res.ok) throw new Error(`${res.status} for ${name}`);
  return res.json();
}

async function download(dir: URL, id: number, gamePath: string) {
  const res = await fetch(CDN + iconPath(gamePath));
  if (!res.ok) throw new Error(`${res.status} for icon ${id}`);
  await writeFile(new URL(`${id}.webp`, dir), Buffer.from(await res.arrayBuffer()));
}

async function main() {
  const [rawCharacters, rawEchoes, rawSonatas] = await Promise.all([
    getJson<RawCharacter>("character.json"),
    getJson<RawEcho>("echo.json"),
    getJson<RawSonata>("sonata.json"),
  ]);

  // Rover has a male and a female entry per element — keep one of each name.
  const seen = new Set<string>();
  const characters = Object.entries(rawCharacters)
    .filter(([, c]) => !seen.has(c.en) && seen.add(c.en))
    .map(([id, c]) => ({ id: Number(id), name: c.en, rank: c.rank, element: c.element, icon: c.icon }));

  const echoes = Object.entries(rawEchoes).map(([id, e]) => ({
    id: Number(id),
    name: e.en,
    cost: COST_BY_INTENSITY[e.intensity] ?? 1,
    sonatas: e.group,
    icon: e.icon,
  }));

  const sonatas = Object.values(rawSonatas).map((s) => ({ id: s.id, name: s.name.en, icon: s.icon }));

  const dataDir = new URL("../src/lib/data/", import.meta.url);
  await mkdir(dataDir, { recursive: true });

  const lists = { characters, echoes, sonatas };
  for (const [folder, list] of Object.entries(lists)) {
    const dir = new URL(`../public/icons/${folder}/`, import.meta.url);
    await mkdir(dir, { recursive: true });
    for (const item of list) {
      await download(dir, item.id, item.icon);
      console.log(`✓ ${folder}/${item.id} ${item.name}`);
    }
    const trimmed = list.map((item) => ({ ...item, icon: undefined }));
    await writeFile(new URL(`${folder}.json`, dataDir), JSON.stringify(trimmed, null, 2) + "\n");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
