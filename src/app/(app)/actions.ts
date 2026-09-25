"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { parseDateInput, toDayStart } from "@/lib/date";
import { BannerType } from "@prisma/client";

export async function saveTodayBalance(_prevState: { error?: string } | undefined, formData: FormData) {
  const amountRaw = formData.get("amount");
  const amount = Number(amountRaw);

  if (!Number.isFinite(amount) || amount < 0) {
    return { error: "Введіть коректну кількість astrite" };
  }

  const date = toDayStart(new Date());

  await prisma.balanceEntry.create({ data: { date, amount } });

  revalidatePath("/");
  revalidatePath("/history");
  return { error: undefined };
}

export async function updateBalanceEntry(
  id: string,
  _prevState: { error?: string } | undefined,
  formData: FormData,
) {
  const amount = Number(formData.get("amount"));
  const dateRaw = String(formData.get("date") ?? "");

  if (!Number.isFinite(amount) || amount < 0) {
    return { error: "Введіть коректну кількість astrite" };
  }
  if (!dateRaw) {
    return { error: "Введіть дату" };
  }

  const date = parseDateInput(dateRaw);

  await prisma.balanceEntry.update({ where: { id }, data: { date, amount } });

  revalidatePath("/");
  revalidatePath("/history");
  return { error: undefined };
}

export async function deleteBalanceEntry(id: string) {
  await prisma.balanceEntry.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/history");
}

export async function incrementPity(bannerType: BannerType, amount = 1) {
  await prisma.pityCounter.upsert({
    where: { bannerType },
    create: { bannerType, currentPity: amount },
    update: { currentPity: { increment: amount } },
  });

  revalidatePath("/");
}

export async function resetPity(bannerType: BannerType) {
  await prisma.pityCounter.upsert({
    where: { bannerType },
    create: { bannerType, currentPity: 0 },
    update: { currentPity: 0 },
  });

  revalidatePath("/");
}
