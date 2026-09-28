/**
 * Downloads material icons into public/materials/<id>.webp.
 * Run: npx tsx scripts/fetch-material-icons.ts
 */
import { mkdir, writeFile } from "node:fs/promises";
import { ALL_MATERIALS } from "../src/lib/materials";

const CDN = "https://static.nanoka.cc/assets/ww/";

const ICONS: Record<number, string> = {
  41100011: "UIResources/Common/Image/IconMout/T_IconMout_O_002_1_UI.webp",
  41100012: "UIResources/Common/Image/IconMout/T_IconMout_O_002_2_UI.webp",
  41100013: "UIResources/Common/Image/IconMout/T_IconMout_O_002_3_UI.webp",
  41100014: "UIResources/Common/Image/IconMout/T_IconMout_O_002_4_UI.webp",
  41100021: "UIResources/Common/Image/IconMout/T_IconMout_E_002_1_UI.webp",
  41100022: "UIResources/Common/Image/IconMout/T_IconMout_E_002_2_UI.webp",
  41100023: "UIResources/Common/Image/IconMout/T_IconMout_E_002_3_UI.webp",
  41100024: "UIResources/Common/Image/IconMout/T_IconMout_E_002_4_UI.webp",
  41100031: "UIResources/Common/Image/IconMout/T_IconMout_O_003_1_UI.webp",
  41100032: "UIResources/Common/Image/IconMout/T_IconMout_O_003_2_UI.webp",
  41100033: "UIResources/Common/Image/IconMout/T_IconMout_O_003_3_UI.webp",
  41100034: "UIResources/Common/Image/IconMout/T_IconMout_O_003_4_UI.webp",
  41100041: "UIResources/Common/Image/IconMout/T_IconMout_O_004_1_UI.webp",
  41100042: "UIResources/Common/Image/IconMout/T_IconMout_O_004_2_UI.webp",
  41100043: "UIResources/Common/Image/IconMout/T_IconMout_O_004_3_UI.webp",
  41100044: "UIResources/Common/Image/IconMout/T_IconMout_O_004_4_UI.webp",
  41100051: "UIResources/Common/Image/IconMout/T_IconMout_O_005_1_UI.webp",
  41100052: "UIResources/Common/Image/IconMout/T_IconMout_O_005_2_UI.webp",
  41100053: "UIResources/Common/Image/IconMout/T_IconMout_O_005_3_UI.webp",
  41100054: "UIResources/Common/Image/IconMout/T_IconMout_O_005_4_UI.webp",
  41100061: "UIResources/Common/Image/IconWup/T_IconWup_021_UI.webp",
  41100062: "UIResources/Common/Image/IconWup/T_IconWup_022_UI.webp",
  41100063: "UIResources/Common/Image/IconWup/T_IconWup_023_UI.webp",
  41100064: "UIResources/Common/Image/IconWup/T_IconWup_024_UI.webp",
  41100071: "UIResources/Common/Image/IconWup/T_IconWup_025_UI.webp",
  41100072: "UIResources/Common/Image/IconWup/T_IconWup_026_UI.webp",
  41100073: "UIResources/Common/Image/IconWup/T_IconWup_027_UI.webp",
  41100074: "UIResources/Common/Image/IconWup/T_IconWup_028_UI.webp",
  41100081: "UIResources/Common/Image/IconMout/T_IconMout_O_007_1_UI.webp",
  41100082: "UIResources/Common/Image/IconMout/T_IconMout_O_007_2_UI.webp",
  41100083: "UIResources/Common/Image/IconMout/T_IconMout_O_007_3_UI.webp",
  41100084: "UIResources/Common/Image/IconMout/T_IconMout_O_007_4_UI.webp",
  41100091: "UIResources/Common/Image/IconMout/T_IconMout_O_013_1_UI.webp",
  41100092: "UIResources/Common/Image/IconMout/T_IconMout_O_013_2_UI.webp",
  41100093: "UIResources/Common/Image/IconMout/T_IconMout_O_013_3_UI.webp",
  41100094: "UIResources/Common/Image/IconMout/T_IconMout_O_013_4_UI.webp",
  41200031: "UIResources/Common/Image/IconMout/T_IconMout_001_UI.webp",
  41200032: "UIResources/Common/Image/IconMout/T_IconMout_002_UI.webp",
  41200033: "UIResources/Common/Image/IconMout/T_IconMout_003_UI.webp",
  41200034: "UIResources/Common/Image/IconMout/T_IconMout_004_UI.webp",
  43020011: "UIResources/Common/Image/IconWup/T_IconWup_Setpup_004_1_UI.webp",
  43020012: "UIResources/Common/Image/IconWup/T_IconWup_Setpup_004_2_UI.webp",
  43020013: "UIResources/Common/Image/IconWup/T_IconWup_Setpup_004_3_UI.webp",
  43020014: "UIResources/Common/Image/IconWup/T_IconWup_Setpup_004_4_UI.webp",
  43020021: "UIResources/Common/Image/IconWup/T_IconWup_01_UI.webp",
  43020022: "UIResources/Common/Image/IconWup/T_IconWup_02_UI.webp",
  43020023: "UIResources/Common/Image/IconWup/T_IconWup_03_UI.webp",
  43020024: "UIResources/Common/Image/IconWup/T_IconWup_04_UI.webp",
  43020031: "UIResources/Common/Image/IconWup/T_IconWup_005_UI.webp",
  43020032: "UIResources/Common/Image/IconWup/T_IconWup_006_UI.webp",
  43020033: "UIResources/Common/Image/IconWup/T_IconWup_007_UI.webp",
  43020034: "UIResources/Common/Image/IconWup/T_IconWup_008_UI.webp",
  43020041: "UIResources/Common/Image/IconWup/T_IconWup_009_UI.webp",
  43020042: "UIResources/Common/Image/IconWup/T_IconWup_010_UI.webp",
  43020043: "UIResources/Common/Image/IconWup/T_IconWup_011_UI.webp",
  43020044: "UIResources/Common/Image/IconWup/T_IconWup_012_UI.webp",
  43020051: "UIResources/Common/Image/IconWup/T_IconWup_013_UI.webp",
  43020052: "UIResources/Common/Image/IconWup/T_IconWup_014_UI.webp",
  43020053: "UIResources/Common/Image/IconWup/T_IconWup_015_UI.webp",
  43020054: "UIResources/Common/Image/IconWup/T_IconWup_016_UI.webp",
  43021011: "UIResources/Common/Image/IconMout/T_IconMout_O_010_1_UI.webp",
  43021012: "UIResources/Common/Image/IconMout/T_IconMout_O_010_2_UI.webp",
  43021013: "UIResources/Common/Image/IconMout/T_IconMout_O_010_3_UI.webp",
  43021014: "UIResources/Common/Image/IconMout/T_IconMout_O_010_4_UI.webp",
  43021021: "UIResources/Common/Image/IconMout/T_IconMout_O_009_1_UI.webp",
  43021022: "UIResources/Common/Image/IconMout/T_IconMout_O_009_2_UI.webp",
  43021023: "UIResources/Common/Image/IconMout/T_IconMout_O_009_3_UI.webp",
  43021024: "UIResources/Common/Image/IconMout/T_IconMout_O_009_4_UI.webp",
  43021031: "UIResources/Common/Image/IconMout/T_IconMout_O_012_1_UI.webp",
  43021032: "UIResources/Common/Image/IconMout/T_IconMout_O_012_2_UI.webp",
  43021033: "UIResources/Common/Image/IconMout/T_IconMout_O_012_3_UI.webp",
  43021034: "UIResources/Common/Image/IconMout/T_IconMout_O_012_4_UI.webp",
  43021041: "UIResources/Common/Image/IconMout/T_IconMout_O_011_1_UI.webp",
  43021042: "UIResources/Common/Image/IconMout/T_IconMout_O_011_2_UI.webp",
  43021043: "UIResources/Common/Image/IconMout/T_IconMout_O_011_3_UI.webp",
  43021044: "UIResources/Common/Image/IconMout/T_IconMout_O_011_4_UI.webp",
  43021051: "UIResources/Common/Image/IconMout/T_IconMout_O_008_1_UI.webp",
  43021052: "UIResources/Common/Image/IconMout/T_IconMout_O_008_2_UI.webp",
  43021053: "UIResources/Common/Image/IconMout/T_IconMout_O_008_3_UI.webp",
  43021054: "UIResources/Common/Image/IconMout/T_IconMout_O_008_4_UI.webp",
};

async function main() {
  const dir = new URL("../public/materials/", import.meta.url);
  await mkdir(dir, { recursive: true });

  for (const material of ALL_MATERIALS) {
    const path = ICONS[material.id];
    if (!path) throw new Error(`No icon for ${material.id} (${material.name})`);
    const res = await fetch(CDN + path);
    if (!res.ok) throw new Error(`${res.status} for ${material.name}`);
    await writeFile(new URL(`${material.id}.webp`, dir), Buffer.from(await res.arrayBuffer()));
    console.log(`✓ ${material.id} ${material.name}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
