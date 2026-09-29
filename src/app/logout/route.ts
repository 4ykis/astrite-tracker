import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth";

function logout(request: NextRequest) {
  // 303 so the navbar's POST form lands on /login as a GET.
  const response = NextResponse.redirect(new URL("/login", request.url), 303);
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}

export const GET = logout;
export const POST = logout;
