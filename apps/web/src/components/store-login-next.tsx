"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { AUTH_REDIRECT_NEXT_KEY, safeRedirectPath } from "@/lib/safe-redirect-path";

/** Persists `?next=` from the login URL so `/auth/callback` can return there after sign-in. */
export function StoreLoginNext() {
  const searchParams = useSearchParams();
  const nextRaw = searchParams.get("next");
  useEffect(() => {
    const next = safeRedirectPath(nextRaw);
    if (next) sessionStorage.setItem(AUTH_REDIRECT_NEXT_KEY, next);
  }, [nextRaw]);
  return null;
}
