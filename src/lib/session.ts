import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Id of the logged-in user; redirects to /login when there is no valid
 * session. Every query must be scoped by this id.
 */
export const requireUserId = cache(async (): Promise<string> => {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  const userId = await verifySessionToken(token);
  if (!userId) redirect("/login");
  return userId;
});

export const getCurrentUser = cache(async () => {
  const userId = await requireUserId();
  const user = await prisma.user.findUnique({ where: { id: userId } });
  // The account was deleted after the cookie was issued.
  if (!user) redirect("/logout");
  return user;
});
