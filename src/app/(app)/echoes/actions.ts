"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { CHARACTER_BY_ID, EchoSlot, emptySlot, ECHO_COUNT, normalizeSlots } from "@/lib/echoes";

export async function createBuild() {
  const last = await prisma.echoBuild.aggregate({ _max: { position: true } });
  await prisma.echoBuild.create({
    data: { slots: Array.from({ length: ECHO_COUNT }, emptySlot), position: (last._max.position ?? 0) + 1 },
  });
  revalidatePath("/echoes");
}

export async function updateBuild(id: string, characterId: number | null, slots: EchoSlot[]) {
  const character = characterId === null ? null : (CHARACTER_BY_ID.get(characterId)?.id ?? null);
  await prisma.echoBuild.update({
    where: { id },
    data: { characterId: character, slots: normalizeSlots(slots) },
  });
  revalidatePath("/echoes");
}

export async function setBuildCollapsed(id: string, collapsed: boolean) {
  await prisma.echoBuild.update({ where: { id }, data: { collapsed } });
  revalidatePath("/echoes");
}

/** Swaps the build with its neighbour above (-1) or below (+1). */
export async function moveBuild(id: string, direction: -1 | 1) {
  const builds = await prisma.echoBuild.findMany({
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    select: { id: true },
  });
  const from = builds.findIndex((b) => b.id === id);
  const to = from + direction;
  if (from === -1 || to < 0 || to >= builds.length) return;

  [builds[from], builds[to]] = [builds[to], builds[from]];
  // Rewrite every position so ties from older rows can't make the swap a no-op.
  await prisma.$transaction(
    builds.map((b, index) => prisma.echoBuild.update({ where: { id: b.id }, data: { position: index + 1 } })),
  );
  revalidatePath("/echoes");
}

export async function deleteBuild(id: string) {
  await prisma.echoBuild.delete({ where: { id } });
  revalidatePath("/echoes");
}
