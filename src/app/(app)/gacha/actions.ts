"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { toDayStart } from "@/lib/date";
import { BannerType, PullResult } from "@prisma/client";

export async function addPullEntry(_prevState: { error?: string } | undefined, formData: FormData) {
  const bannerType = String(formData.get("bannerType"));
  const bannerName = String(formData.get("bannerName") ?? "").trim();
  const itemName = String(formData.get("itemName") ?? "").trim();
  const result = String(formData.get("result"));
  const pityAtPull = Number(formData.get("pityAtPull"));

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

  await prisma.$transaction([
    prisma.pullEntry.create({
      data: {
        date: toDayStart(new Date()),
        bannerType: bannerType as BannerType,
        bannerName,
        itemName,
        result: result as PullResult,
        pityAtPull,
      },
    }),
    prisma.pityCounter.upsert({
      where: { bannerType: bannerType as BannerType },
      create: { bannerType: bannerType as BannerType, currentPity: 0 },
      update: { currentPity: 0 },
    }),
  ]);

  revalidatePath("/gacha");
  revalidatePath("/");
  revalidatePath("/history");
  return { error: undefined };
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
      date: toDayStart(new Date(`${dateRaw}T00:00:00Z`)),
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
