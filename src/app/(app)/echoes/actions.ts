"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { CHARACTER_BY_ID, EchoSlot, emptySlot, ECHO_COUNT, normalizeSlots } from "@/lib/echoes";

export async function createBuild() {
  await prisma.echoBuild.create({
    data: { slots: Array.from({ length: ECHO_COUNT }, emptySlot) },
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

export async function deleteBuild(id: string) {
  await prisma.echoBuild.delete({ where: { id } });
  revalidatePath("/echoes");
}
