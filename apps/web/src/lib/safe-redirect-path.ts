/** SessionStorage key: post-login path from `/login?next=…` (magic link flow). */
export const AUTH_REDIRECT_NEXT_KEY = "exness_clone_auth_next";

/** Allow only same-app relative paths (avoids open redirects). */
export function safeRedirectPath(path: string | null | undefined): string | null {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return null;
  if (path.includes("://") || path.includes("\\")) return null;
  return path;
}
