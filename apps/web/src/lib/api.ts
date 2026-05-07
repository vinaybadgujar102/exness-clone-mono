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
  const data = await parseJsonSafe(res);
  if (!res.ok) {
    const msg = extractErrorMessage(data) ?? `Request failed (${res.status})`;
    throw new Error(msg);
  }
  const payload = unwrapResponseData(data, 2);
  return (payload as LoginResponse | null) ?? {};
}

export async function postSignup(email: string): Promise<LoginResponse> {
  const res = await fetch(`${getApiBaseUrl()}/api/v1/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
    credentials: "include",
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) {
    const msg = extractErrorMessage(data) ?? `Request failed (${res.status})`;
    throw new Error(msg);
  }
  const payload = unwrapResponseData(data, 2);
  return (payload as LoginResponse | null) ?? {};
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

/** Open position row returned by GET /api/v1/trade/trades */
export type OpenTrade = {
  id: string;
  email: string;
  asset: string;
  side: "BUY" | "SELL";
  entryPrice: number;
  margin: number;
  leverage: number;
  notional: number;
  quantity: number;
  pnl: number;
  status: "OPEN" | "CLOSED";
  createdAt: number;
  liquidationPrice: number;
};

export type OpenPositions = {
  trades: OpenTrade[];
  balance: number;
};

export type ClosedTrade = {
  id: number;
  userId: number;
  asset: "BTCUSDT" | "ETHUSDT";
  side: "BUY" | "SELL";
  entryPrice: number;
  margin: number;
  leverage: number;
  notional: number;
  quantity: number;
  pnl: number;
  liquidationPrice: number;
  createdAt: string;
};

/** GET /api/v1/trade/trades — requires auth cookie */
export async function getOpenPositions(): Promise<OpenPositions> {
  const res = await fetch(`${getApiBaseUrl()}/api/v1/trade/trades`, {
    method: "GET",
    credentials: "include",
  });

  const data = await parseJsonSafe(res);

  if (!res.ok) {
    const msg = extractErrorMessage(data) ?? `Request failed (${res.status})`;
    throw new Error(msg);
  }

  const payload = unwrapResponseData(data, 2);

  if (!payload || typeof payload !== "object") {
    return { trades: [], balance: 10_000 };
  }
  const inner = payload;
  if (Array.isArray(inner)) {
    return { trades: inner as OpenTrade[], balance: 10_000 };
  }
  if (inner && typeof inner === "object" && !Array.isArray(inner)) {
    const d = inner as Record<string, unknown>;
    const trades = Array.isArray(d.trades) ? (d.trades as OpenTrade[]) : [];
    const balance =
      typeof d.balance === "number" ? d.balance : 10_000;
    return { trades, balance };
  }
  return { trades: [], balance: 10_000 };
}

/** GET /api/v1/trade/trades/closed — requires auth cookie */
export async function getClosedPositions(): Promise<ClosedTrade[]> {
  const res = await fetch(`${getApiBaseUrl()}/api/v1/trade/trades/closed`, {
    method: "GET",
    credentials: "include",
  });

  const data = await parseJsonSafe(res);

  if (!res.ok) {
    const msg = extractErrorMessage(data) ?? `Request failed (${res.status})`;
    throw new Error(msg);
  }

  const payload = unwrapResponseData(data, 2);
  if (!Array.isArray(payload)) return [];
  return payload as ClosedTrade[];
}

/** POST /api/v1/trade/close — requires auth cookie */
export async function postCloseTrade(
  tradeId: string,
): Promise<{ balance: number }> {
  const res = await fetch(`${getApiBaseUrl()}/api/v1/trade/close`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tradeId }),
    credentials: "include",
  });

  const data = await parseJsonSafe(res);

  if (!res.ok) {
    const msg = extractErrorMessage(data) ?? `Request failed (${res.status})`;
    throw new Error(msg);
  }

  const payload = unwrapResponseData(data, 2);

  let balance = 10_000;
  if (payload && typeof payload === "object") {
    const b = (payload as Record<string, unknown>).balance;
      if (typeof b === "number") balance = b;
  }
  return { balance };
}

/** POST /api/v1/trade/trade — requires auth cookie */
export async function postOpenTrade(body: OpenTradePayload): Promise<unknown> {
  const res = await fetch(`${getApiBaseUrl()}/api/v1/trade/trade`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include",
  });

  const data = await parseJsonSafe(res);

  if (!res.ok) {
    const msg = extractErrorMessage(data) ?? `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return unwrapResponseData(data, 2);
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

  const data = await parseJsonSafe(res);
  return unwrapResponseData(data, 2);
}

async function parseJsonSafe(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function unwrapResponseData(input: unknown, levels: number): unknown {
  let current = input;
  for (let i = 0; i < levels; i += 1) {
    if (!current || typeof current !== "object") return current;
    const record = current as Record<string, unknown>;
    if (!("data" in record)) return current;
    current = record.data;
  }
  return current;
}
