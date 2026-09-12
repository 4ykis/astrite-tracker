"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  createSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  verifyPasscode,
} from "@/lib/auth";

export async function login(_prevState: { error?: string } | undefined, formData: FormData) {
  const passcode = String(formData.get("passcode") ?? "");

  if (!verifyPasscode(passcode)) {
    return { error: "Невірний код доступу" };
  }

  const token = await createSessionToken();
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
  });

  redirect("/");
}
