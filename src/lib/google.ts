const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";

export const OAUTH_COOKIE_NAME = "wuwa_oauth";
export const OAUTH_COOKIE_PATH = "/login/google";
export const OAUTH_COOKIE_MAX_AGE_SECONDS = 60 * 10;

function getClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET env vars are not set");
  }
  return { clientId, clientSecret };
}

function callbackUrl(origin: string) {
  return `${origin}/login/google/callback`;
}

function randomToken() {
  return Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString("base64url");
}

async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Buffer.from(digest).toString("base64url");
}

/**
 * Starts the authorization-code flow with PKCE. `cookie` (`<state>.<verifier>`)
 * must be stored httpOnly and checked in the callback.
 */
export async function buildAuthorizationUrl(origin: string) {
  const state = randomToken();
  const verifier = randomToken();
  const url = new URL(AUTH_URL);
  url.search = new URLSearchParams({
    client_id: getClient().clientId,
    redirect_uri: callbackUrl(origin),
    response_type: "code",
    scope: "openid email profile",
    state,
    code_challenge: await sha256(verifier),
    code_challenge_method: "S256",
    prompt: "select_account",
  }).toString();
  return { url, cookie: `${state}.${verifier}` };
}

export type GoogleProfile = {
  sub: string;
  email: string | null;
  name: string | null;
  picture: string | null;
};

/**
 * Exchanges the code for tokens and reads the profile from the id_token. The
 * token comes straight from Google's token endpoint over TLS, so its claims
 * can be trusted without checking the signature.
 */
export async function exchangeCode(origin: string, code: string, verifier: string): Promise<GoogleProfile> {
  const { clientId, clientSecret } = getClient();
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: callbackUrl(origin),
      grant_type: "authorization_code",
      code_verifier: verifier,
    }),
  });
  if (!response.ok) {
    throw new Error(`Google token exchange failed: ${response.status} ${await response.text()}`);
  }

  const { id_token: idToken } = (await response.json()) as { id_token?: string };
  const payload = idToken?.split(".")[1];
  if (!payload) throw new Error("Google response has no id_token");

  const claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
    sub: string;
    aud: string;
    email?: string;
    email_verified?: boolean;
    name?: string;
    picture?: string;
  };
  if (claims.aud !== clientId) throw new Error("id_token audience mismatch");

  return {
    sub: claims.sub,
    email: claims.email && claims.email_verified ? claims.email.toLowerCase() : null,
    name: claims.name ?? null,
    picture: claims.picture ?? null,
  };
}
