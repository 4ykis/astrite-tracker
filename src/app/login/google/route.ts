import { NextRequest, NextResponse } from "next/server";
import {
  buildAuthorizationUrl,
  OAUTH_COOKIE_MAX_AGE_SECONDS,
  OAUTH_COOKIE_NAME,
  OAUTH_COOKIE_PATH,
} from "@/lib/google";

export async function GET(request: NextRequest) {
  const { url, cookie } = await buildAuthorizationUrl(request.nextUrl.origin);

  const response = NextResponse.redirect(url);
  response.cookies.set(OAUTH_COOKIE_NAME, cookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: OAUTH_COOKIE_MAX_AGE_SECONDS,
    path: OAUTH_COOKIE_PATH,
  });
  return response;
}
