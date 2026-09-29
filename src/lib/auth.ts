const SESSION_COOKIE_NAME = "wuwa_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET env var is not set");
  }
  return secret;
}

async function hmac(data: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return Buffer.from(signature).toString("base64url");
}

/** Builds a signed session token: `<userId>.<expiryEpochSeconds>.<signature>`. */
export async function createSessionToken(userId: string): Promise<string> {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS;
  const payload = `${userId}.${expiresAt}`;
  const signature = await hmac(payload, getSecret());
  return `${payload}.${signature}`;
}

/** Returns the user id the token was issued for, or null if it is missing, forged or expired. */
export async function verifySessionToken(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  const [userId, expiry, signature] = token.split(".");
  if (!userId || !expiry || !signature) return null;

  const expected = await hmac(`${userId}.${expiry}`, getSecret());
  if (expected !== signature) return null;

  const expiresAt = Number(expiry);
  if (!Number.isFinite(expiresAt) || Date.now() / 1000 > expiresAt) return null;

  return userId;
}

export { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS };
