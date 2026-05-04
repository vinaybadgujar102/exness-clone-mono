/**
 * Browser calls the Express API (default :3000). Use NEXT_PUBLIC_API_BASE_URL to override.
 * Session uses httpOnly cookie `sessionToken` from the API; requests use credentials: "include".
 * If login never persists locally, the API sets Secure cookies — use HTTPS for the API or adjust cookie flags server-side.
 */
export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";
  }
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";
}

export type LoginResponse = {
  message?: string;
  link?: string;
};

export async function postLogin(email: string): Promise<LoginResponse> {
  const res = await fetch(`${getApiBaseUrl()}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
    credentials: "include",
  });
  return (await res.json()) as LoginResponse;
}

export async function postSignup(email: string): Promise<LoginResponse> {
  const res = await fetch(`${getApiBaseUrl()}/api/v1/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
    credentials: "include",
  });
  return (await res.json()) as LoginResponse;
}

export async function postLogout(): Promise<void> {
  await fetch(`${getApiBaseUrl()}/api/v1/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
}

/** Matches `openTradeRequest` in apps/api/src/validators/tradeValidator.ts */
export type OpenTradePayload = {
  asset: "BTCUSDT" | "ETHUSDT";
  side: "BUY" | "SELL";
  margin: number;
  leverage: number;
};

/** POST /api/v1/trade/trade — requires auth cookie */
export async function postOpenTrade(body: OpenTradePayload): Promise<unknown> {
  const res = await fetch(`${getApiBaseUrl()}/api/v1/trade/trade`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include",
  });

  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const msg = extractErrorMessage(data) ?? `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return data;
}

function extractErrorMessage(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const o = data as Record<string, unknown>;
  if (typeof o.error === "string") return o.error;
  if (typeof o.message === "string") return o.message;
  return undefined;
}

/** Complete magic-link step; sets session cookie when CORS + cookie policy allow. */
export async function getLoginPost(token: string): Promise<Response> {
  const q = encodeURIComponent(token);
  return fetch(`${getApiBaseUrl()}/api/v1/auth/login/post?token=${q}`, {
    method: "GET",
    credentials: "include",
  });
}

export async function getKlines(asset: string, interval: string) {
  const res = await fetch(
    `${getApiBaseUrl()}/api/v1/chart?symbol=${asset}&limit=100&interval=${interval}`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  if (!res.ok) {
    return null;
  }

  const data = await res.json();
  return data.data;
}
