/**
 * Browser calls the Express API (default :3000). Use NEXT_PUBLIC_API_BASE_URL to override.
 * Session uses httpOnly cookie `sessionToken` from the API; requests use credentials: "include".
 * If login never persists locally, the API sets Secure cookies — use HTTPS for the API or adjust cookie flags server-side.
 */
export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    console.log(process.env.NEXT_PUBLIC_API_BASE_URL);
    return process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";
  }
  console.log(process.env.NEXT_PUBLIC_API_BASE_URL);
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";
}

export type LoginResponse = {
  message?: string;
  link?: string;
};

export type OrderApiPayload = {
  success: boolean;
  message: string;
  data?: unknown;
};

export type OrderApiEnvelope = {
  kind?: string;
  requestId?: string;
  payload?: OrderApiPayload;
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

/** Complete magic-link step; sets session cookie when CORS + cookie policy allow. */
export async function getLoginPost(token: string): Promise<Response> {
  const q = encodeURIComponent(token);
  return fetch(`${getApiBaseUrl()}/api/v1/auth/login/post?token=${q}`, {
    method: "GET",
    credentials: "include",
  });
}

export async function postOpenTrade(body: {
  asset: string;
  quantity: number;
  margin: number;
  side: "BUY" | "SELL";
  leverage: number;
}): Promise<{
  ok: boolean;
  status: number;
  envelope?: OrderApiEnvelope;
  raw?: unknown;
}> {
  const res = await fetch(`${getApiBaseUrl()}/api/v1/trade/trade`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include",
  });
  const raw: unknown = await res.json().catch(() => undefined);
  return {
    ok: res.ok,
    status: res.status,
    envelope: parseOrderResponse(raw),
    raw,
  };
}

function parseOrderResponse(raw: unknown): OrderApiEnvelope | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  if ("data" in o && o.data && typeof o.data === "object") {
    return o.data as OrderApiEnvelope;
  }
  if ("payload" in o && "kind" in o) {
    return raw as OrderApiEnvelope;
  }
  return undefined;
}

export async function postCloseTrade(tradeId: string): Promise<{
  ok: boolean;
  status: number;
  envelope?: OrderApiEnvelope;
  raw?: unknown;
}> {
  const res = await fetch(
    `${getApiBaseUrl()}/api/v1/trade/api/v1/trade/close`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tradeId }),
      credentials: "include",
    },
  );
  const raw: unknown = await res.json().catch(() => undefined);
  return {
    ok: res.ok,
    status: res.status,
    envelope: parseOrderResponse(raw),
    raw,
  };
}
