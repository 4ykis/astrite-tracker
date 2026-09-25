"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { parseDateInput } from "@/lib/date";
import { BannerType } from "@prisma/client";

export async function updateSpendEntry(
  id: string,
  _prevState: { error?: string } | undefined,
  formData: FormData,
) {
  const amount = Number(formData.get("amount"));
  const category = String(formData.get("category"));
  const bannerName = String(formData.get("bannerName") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();
  const dateRaw = String(formData.get("date") ?? "");

  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: "Введіть коректну суму витрати" };
  }
  if (category !== "CHARACTER" && category !== "WEAPON") {
    return { error: "Оберіть категорію баннера" };
  }
  if (!dateRaw) {
    return { error: "Введіть дату" };
  }

  await prisma.spendEntry.update({
    where: { id },
    data: {
      date: parseDateInput(dateRaw),
      amount,
      category: category as BannerType,
      bannerName: bannerName || null,
      note: note || null,
    },
  });

  revalidatePath("/");
  revalidatePath("/stats");
  revalidatePath("/history");
  return { error: undefined };
}

export async function deleteSpendEntry(id: string) {
  await prisma.spendEntry.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/stats");
  revalidatePath("/history");
}
