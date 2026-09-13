"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { toDayStart } from "@/lib/date";
import { BannerType } from "@prisma/client";

export async function saveTodayBalance(_prevState: { error?: string } | undefined, formData: FormData) {
  const amountRaw = formData.get("amount");
  const amount = Number(amountRaw);

  if (!Number.isFinite(amount) || amount < 0) {
    return { error: "Введіть коректну кількість astrite" };
  }

  const date = toDayStart(new Date());

  await prisma.balanceEntry.upsert({
    where: { date },
    create: { date, amount },
    update: { amount },
  });

  revalidatePath("/");
  return { error: undefined };
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
