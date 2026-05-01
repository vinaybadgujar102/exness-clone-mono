"use client";

import { useState } from "react";

import { postLogin, postSignup } from "@/lib/api";

type Tab = "signin" | "register";

export function LoginForm() {
  const [tab, setTab] = useState<Tab>("signin");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);

  async function onLogin() {
    setBusy(true);
    setMessage(null);
    setLink(null);
    try {
      const res = await postLogin(email.trim());
      setMessage(res.message ?? null);
      setLink(res.link ?? null);
    } catch {
      setMessage("Network error — is the API running on port 3000?");
    } finally {
      setBusy(false);
    }
  }

  async function onSignup() {
    setBusy(true);
    setMessage(null);
    setLink(null);
    try {
      const res = await postSignup(email.trim());
      setMessage(res.message ?? null);
      setLink(res.link ?? null);
    } catch {
      setMessage("Network error — is the API running on port 3000?");
    } finally {
      setBusy(false);
    }
  }

  async function onSubmit() {
    if (tab === "signin") await onLogin();
    else await onSignup();
  }

  return (
    <div className="space-y-8">
      <div
        className="flex border-b border-neutral-200"
        role="tablist"
        aria-label="Account"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === "signin"}
          onClick={() => {
            setTab("signin");
            setMessage(null);
            setLink(null);
          }}
          className={`relative flex-1 pb-3 text-center text-[15px] font-medium transition ${
            tab === "signin"
              ? "text-black after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-black"
              : "text-neutral-400 hover:text-neutral-600"
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "register"}
          onClick={() => {
            setTab("register");
            setMessage(null);
            setLink(null);
          }}
          className={`relative flex-1 pb-3 text-center text-[15px] font-medium transition ${
            tab === "register"
              ? "text-black after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-black"
              : "text-neutral-400 hover:text-neutral-600"
          }`}
        >
          Create an account
        </button>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="login-email"
          className="block text-sm text-neutral-500"
        >
          Your email address
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder=""
          className="h-12 w-full rounded-lg border border-neutral-300 bg-white px-3.5 text-[15px] text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-500 focus:ring-1 focus:ring-neutral-400"
        />
      </div>

      <button
        type="button"
        disabled={busy || !email.trim()}
        onClick={() => void onSubmit()}
        className="flex h-12 w-full items-center justify-center rounded-lg bg-[#FFD700] text-[15px] font-medium text-black transition enabled:hover:brightness-[0.98] enabled:active:brightness-95 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {busy
          ? "Please wait…"
          : tab === "signin"
            ? "Sign in"
            : "Create an account"}
      </button>

      {message && (
        <p className="text-center text-sm text-neutral-600">{message}</p>
      )}
      {link && (
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
          <p className="text-xs text-neutral-500">Magic link</p>
          <a
            href={link}
            className="mt-1 break-all text-sm text-neutral-900 underline underline-offset-2 hover:text-neutral-700"
          >
            {link}
          </a>
          <p className="mt-3 text-xs leading-relaxed text-neutral-500">
            If the link targets the API host, open it there, then return here.
            Or use{" "}
            <code className="rounded bg-neutral-200 px-1 py-0.5 text-[11px]">
              /auth/callback?token=…
            </code>{" "}
            with the token from the link.
          </p>
        </div>
      )}
    </div>
  );
}
