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

/** Complete magic-link step; sets session cookie when CORS + cookie policy allow. */
export async function getLoginPost(token: string): Promise<Response> {
  const q = encodeURIComponent(token);
  return fetch(`${getApiBaseUrl()}/api/v1/auth/login/post?token=${q}`, {
    method: "GET",
    credentials: "include",
  });
}
