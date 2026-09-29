"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { parseDateInput, toDayStart } from "@/lib/date";

export async function saveTodayBalance(_prevState: { error?: string } | undefined, formData: FormData) {
  const amountRaw = formData.get("amount");
  const amount = Number(amountRaw);

  if (!Number.isFinite(amount) || amount < 0) {
    return { error: "Введіть коректну кількість astrite" };
  }

  const userId = await requireUserId();
  const date = toDayStart(new Date());

  await prisma.balanceEntry.create({ data: { userId, date, amount } });

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

  const userId = await requireUserId();
  const date = parseDateInput(dateRaw);

  await prisma.balanceEntry.update({ where: { id, userId }, data: { date, amount } });

  revalidatePath("/");
  revalidatePath("/history");
  return { error: undefined };
}

export async function deleteBalanceEntry(id: string) {
  const userId = await requireUserId();
  await prisma.balanceEntry.delete({ where: { id, userId } });
  revalidatePath("/");
  revalidatePath("/history");
}
