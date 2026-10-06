"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import {
  CHARACTER_BY_ID,
  EchoSlot,
  emptySlot,
  ECHO_COUNT,
  normalizeSlots,
  validForteNodes,
  validWeaponId,
} from "@/lib/echoes";

export type BuildData = {
  characterId: number | null;
  weaponId: number | null;
  forteNodes: number;
  slots: EchoSlot[];
};

export async function createBuild() {
  const userId = await requireUserId();
  const last = await prisma.echoBuild.aggregate({ where: { userId }, _max: { position: true } });
  await prisma.echoBuild.create({
    data: {
      userId,
      slots: Array.from({ length: ECHO_COUNT }, emptySlot),
      position: (last._max.position ?? 0) + 1,
    },
  });
  revalidatePath("/echoes");
}

export async function updateBuild(id: string, build: BuildData) {
  const userId = await requireUserId();
  const characterId = build.characterId === null ? null : (CHARACTER_BY_ID.get(build.characterId)?.id ?? null);
  await prisma.echoBuild.update({
    where: { id, userId },
    data: {
      characterId,
      weaponId: validWeaponId(characterId, build.weaponId),
      forteNodes: validForteNodes(build.forteNodes),
      slots: normalizeSlots(build.slots),
    },
  });
  revalidatePath("/echoes");
}

export async function setBuildCollapsed(id: string, collapsed: boolean) {
  const userId = await requireUserId();
  await prisma.echoBuild.update({ where: { id, userId }, data: { collapsed } });
  revalidatePath("/echoes");
}

export async function setBuildFinished(id: string, finished: boolean) {
  const userId = await requireUserId();
  await prisma.echoBuild.update({ where: { id, userId }, data: { finished } });
  revalidatePath("/echoes");
}

/** Swaps the build with its neighbour above (-1) or below (+1). */
export async function moveBuild(id: string, direction: -1 | 1) {
  const userId = await requireUserId();
  const builds = await prisma.echoBuild.findMany({
    where: { userId },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    select: { id: true },
  });
  const from = builds.findIndex((b) => b.id === id);
  const to = from + direction;
  if (from === -1 || to < 0 || to >= builds.length) return;

  [builds[from], builds[to]] = [builds[to], builds[from]];
  // Rewrite every position so ties from older rows can't make the swap a no-op.
  await prisma.$transaction(
    builds.map((b, index) => prisma.echoBuild.update({ where: { id: b.id, userId }, data: { position: index + 1 } })),
  );
  revalidatePath("/echoes");
}

export async function deleteBuild(id: string) {
  const userId = await requireUserId();
  await prisma.echoBuild.delete({ where: { id, userId } });
  revalidatePath("/echoes");
}
