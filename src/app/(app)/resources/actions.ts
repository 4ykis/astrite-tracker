"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { addDays, parseDateInput, toDayStart } from "@/lib/date";
import { ALL_MATERIALS } from "@/lib/materials";
import { getResourcesAsOf } from "@/lib/resources";

function parseDate(raw: FormDataEntryValue | null): Date {
  const value = String(raw ?? "");
  return value ? parseDateInput(value) : toDayStart(new Date());
}

export async function saveResources(_prevState: { error?: string } | undefined, formData: FormData) {
  const date = parseDate(formData.get("date"));
  const values = new Map<number, number>();

  for (const material of ALL_MATERIALS) {
    const raw = formData.get(`item-${material.id}`);
    if (raw === null || raw === "") continue;
    const amount = Number(raw);
    if (!Number.isInteger(amount) || amount < 0) {
      return { error: `Некоректна кількість: ${material.name}` };
    }
    values.set(material.id, amount);
  }

  // Only store items that differ from what the previous days already imply.
  const before = await getResourcesAsOf(addDays(date, -1));
  const upserts = [];
  const unchanged: number[] = [];

  for (const [itemId, amount] of values) {
    if ((before[itemId] ?? 0) === amount) {
      unchanged.push(itemId);
    } else {
      upserts.push(
        prisma.resourceEntry.upsert({
          where: { date_itemId: { date, itemId } },
          create: { date, itemId, amount },
          update: { amount },
        }),
      );
    }
  }

  await prisma.$transaction([
    prisma.resourceEntry.deleteMany({ where: { date, itemId: { in: unchanged } } }),
    ...upserts,
  ]);

  revalidatePath("/resources");
  revalidatePath("/history");
  return { error: undefined };
}

export async function deleteResourceDay(dateIso: string) {
  await prisma.resourceEntry.deleteMany({ where: { date: new Date(dateIso) } });
  revalidatePath("/resources");
  revalidatePath("/history");
}
