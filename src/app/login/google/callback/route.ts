import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "@/lib/auth";
import { exchangeCode, GoogleProfile, OAUTH_COOKIE_NAME, OAUTH_COOKIE_PATH } from "@/lib/google";
import { prisma } from "@/lib/prisma";

// Placeholder user that owns data recorded before logins existed (see the
// 20260929180000_users migration).
const LEGACY_OWNER_ID = "legacy-owner";

/** Finds the user for this Google account, creating it (or claiming the pre-login data) on first login. */
async function upsertUser(profile: GoogleProfile) {
  const data = { email: profile.email, name: profile.name, image: profile.picture };

  const existing = await prisma.user.findUnique({ where: { googleId: profile.sub } });
  if (existing) {
    return prisma.user.update({ where: { id: existing.id }, data });
  }

  const legacyEmail = process.env.LEGACY_OWNER_EMAIL?.trim().toLowerCase();
  if (legacyEmail && profile.email === legacyEmail) {
    const claimed = await prisma.user.updateMany({
      where: { id: LEGACY_OWNER_ID, googleId: null },
      data: { googleId: profile.sub, ...data },
    });
    if (claimed.count > 0) return prisma.user.findUniqueOrThrow({ where: { id: LEGACY_OWNER_ID } });
  }

  return prisma.user.create({ data: { googleId: profile.sub, ...data } });
}

function redirectTo(request: NextRequest, path: string) {
  const response = NextResponse.redirect(new URL(path, request.url));
  response.cookies.delete({ name: OAUTH_COOKIE_NAME, path: OAUTH_COOKIE_PATH });
  return response;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const code = params.get("code");
  const state = params.get("state");
  const [expectedState, verifier] = (request.cookies.get(OAUTH_COOKIE_NAME)?.value ?? "").split(".");

  if (params.get("error")) return redirectTo(request, "/login?error=cancelled");
  if (!code || !state || !verifier || state !== expectedState) {
    return redirectTo(request, "/login?error=state");
  }

  let userId: string;
  try {
    const profile = await exchangeCode(request.nextUrl.origin, code, verifier);
    userId = (await upsertUser(profile)).id;
  } catch (error) {
    console.error(error);
    return redirectTo(request, "/login?error=google");
  }

  const response = redirectTo(request, "/");
  response.cookies.set(SESSION_COOKIE_NAME, await createSessionToken(userId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
  });
  return response;
}
