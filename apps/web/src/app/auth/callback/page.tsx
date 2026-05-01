"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";

import { getLoginPost } from "@/lib/api";
import {
  AUTH_REDIRECT_NEXT_KEY,
  safeRedirectPath,
} from "@/lib/safe-redirect-path";

function CallbackInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">(
    "idle",
  );
  const [detail, setDetail] = useState<string>("");

  useEffect(() => {
    if (!token) {
      setStatus("err");
      setDetail("Missing token query parameter.");
      return;
    }
    let cancelled = false;
    (async () => {
      setStatus("loading");
      try {
        const res = await getLoginPost(token);
        const body = await res.text();
        if (cancelled) return;
        if (!res.ok) {
          setStatus("err");
          setDetail(body || res.statusText);
          return;
        }
        setStatus("ok");
        setDetail(body);
        const fromUrl = safeRedirectPath(searchParams.get("next"));
        const fromSession =
          typeof window !== "undefined"
            ? sessionStorage.getItem(AUTH_REDIRECT_NEXT_KEY)
            : null;
        if (typeof window !== "undefined") {
          sessionStorage.removeItem(AUTH_REDIRECT_NEXT_KEY);
        }
        const target =
          fromUrl ?? safeRedirectPath(fromSession) ?? "/webtrading";
        router.replace(target);
        router.refresh();
      } catch (e) {
        if (cancelled) return;
        setStatus("err");
        setDetail(e instanceof Error ? e.message : "Request failed");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, router, searchParams]);

  return (
    <div className="mx-auto max-w-lg rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-1)] p-8">
      <h1 className="text-lg font-semibold">Completing sign-in</h1>
      {!token && (
        <p className="mt-3 text-sm text-[var(--color-down)]">{detail}</p>
      )}
      {token && status === "loading" && (
        <p className="mt-3 text-sm text-[var(--color-muted)]">Contacting API…</p>
      )}
      {token && status === "ok" && (
        <p className="mt-3 text-sm text-[var(--color-up)]">
          Session established. Redirecting…
        </p>
      )}
      {token && status === "err" && (
        <p className="mt-3 text-sm text-[var(--color-down)]">{detail}</p>
      )}
      <Link
        href="/login"
        className="mt-6 inline-block text-sm text-[var(--color-accent)] hover:underline"
      >
        Back to login
      </Link>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[var(--color-surface-0)] px-4">
      <Suspense
        fallback={
          <p className="text-sm text-[var(--color-muted)]">Loading…</p>
        }
      >
        <CallbackInner />
      </Suspense>
    </div>
  );
}
