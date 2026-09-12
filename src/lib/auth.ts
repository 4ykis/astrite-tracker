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

/** Builds a signed session token: `<expiryEpochSeconds>.<signature>`. */
export async function createSessionToken(): Promise<string> {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS;
  const payload = String(expiresAt);
  const signature = await hmac(payload, getSecret());
  return `${payload}.${signature}`;
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expected = await hmac(payload, getSecret());
  if (expected !== signature) return false;

  const expiresAt = Number(payload);
  if (!Number.isFinite(expiresAt) || Date.now() / 1000 > expiresAt) return false;

  return true;
}

export function verifyPasscode(passcode: string): boolean {
  const expected = process.env.APP_PASSCODE;
  if (!expected) {
    throw new Error("APP_PASSCODE env var is not set");
  }
  return passcode === expected;
}

export { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS };
