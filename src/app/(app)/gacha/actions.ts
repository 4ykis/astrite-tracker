"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { parseDateInput, toDayStart } from "@/lib/date";
import { PULL_COST } from "@/lib/gacha";
import { BannerType, PullResult } from "@prisma/client";

const BANNER_LABEL: Record<BannerType, string> = {
  CHARACTER: "Персонаж",
  WEAPON: "Зброя",
};

function revalidateGachaPaths() {
  revalidatePath("/gacha");
  revalidatePath("/");
  revalidatePath("/history");
  revalidatePath("/stats");
}

/** Logs `pulls` pulls against the pity counter and their astrite cost (pulls * PULL_COST), without a 5★. */
export async function incrementPity(bannerType: BannerType, pulls: number) {
  await prisma.$transaction([
    prisma.pityCounter.upsert({
      where: { bannerType },
      create: { bannerType, currentPity: pulls },
      update: { currentPity: { increment: pulls } },
    }),
    prisma.spendEntry.create({
      data: {
        date: toDayStart(new Date()),
        amount: pulls * PULL_COST,
        category: bannerType,
        note: `${pulls} пул${pulls > 1 ? "и" : ""}`,
      },
    }),
  ]);

  revalidateGachaPaths();
}

export async function resetPity(bannerType: BannerType) {
  await prisma.pityCounter.upsert({
    where: { bannerType },
    create: { bannerType, currentPity: 0 },
    update: { currentPity: 0 },
  });

  revalidateGachaPaths();
}

/** Logs the pull that hit a 5★ (win or lose the 50/50): its astrite cost, the pull itself, and resets pity. */
export async function recordFiveStar(bannerType: BannerType, result: PullResult) {
  const counter = await prisma.pityCounter.findUnique({ where: { bannerType } });
  const pityAtPull = (counter?.currentPity ?? 0) + 1;

  await prisma.$transaction([
    prisma.spendEntry.create({
      data: {
        date: toDayStart(new Date()),
        amount: PULL_COST,
        category: bannerType,
        note: "1 пул (5★)",
      },
    }),
    prisma.pullEntry.create({
      data: {
        date: toDayStart(new Date()),
        bannerType,
        bannerName: BANNER_LABEL[bannerType],
        itemName: "5★",
        result,
        pityAtPull,
      },
    }),
    prisma.pityCounter.upsert({
      where: { bannerType },
      create: { bannerType, currentPity: 0 },
      update: { currentPity: 0 },
    }),
  ]);

  revalidateGachaPaths();
}

export async function updatePullEntry(
  id: string,
  _prevState: { error?: string } | undefined,
  formData: FormData,
) {
  const bannerType = String(formData.get("bannerType"));
  const bannerName = String(formData.get("bannerName") ?? "").trim();
  const itemName = String(formData.get("itemName") ?? "").trim();
  const result = String(formData.get("result"));
  const pityAtPull = Number(formData.get("pityAtPull"));
  const dateRaw = String(formData.get("date") ?? "");

  if (bannerType !== "CHARACTER" && bannerType !== "WEAPON") {
    return { error: "Оберіть тип баннера" };
  }
  if (result !== "WIN" && result !== "LOSE") {
    return { error: "Оберіть результат" };
  }
  if (!bannerName) {
    return { error: "Введіть назву баннера" };
  }
  if (!itemName) {
    return { error: "Введіть здобутого персонажа/зброю" };
  }
  if (!Number.isFinite(pityAtPull) || pityAtPull <= 0) {
    return { error: "Введіть коректний піті на момент отримання 5★" };
  }
  if (!dateRaw) {
    return { error: "Введіть дату" };
  }

  await prisma.pullEntry.update({
    where: { id },
    data: {
      date: parseDateInput(dateRaw),
      bannerType: bannerType as BannerType,
      bannerName,
      itemName,
      result: result as PullResult,
      pityAtPull,
    },
  });

  revalidatePath("/gacha");
  revalidatePath("/");
  revalidatePath("/history");
  return { error: undefined };
}

export async function deletePullEntry(id: string) {
  await prisma.pullEntry.delete({ where: { id } });
  revalidatePath("/gacha");
  revalidatePath("/");
  revalidatePath("/history");
}
