import Link from "next/link";
import { Suspense } from "react";

import { LoginForm } from "@/components/login-form";
import { StoreLoginNext } from "@/components/store-login-next";

function GlobeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-white font-sans text-neutral-900 antialiased">
      <Suspense fallback={null}>
        <StoreLoginNext />
      </Suspense>
      <header className="flex items-center justify-between border-b border-neutral-200 px-5 py-4 sm:px-8">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-black lowercase"
        >
          exness
        </Link>
        <button
          type="button"
          className="rounded-md p-2 text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900"
          aria-label="Language"
        >
          <GlobeIcon />
        </button>
      </header>

      <div className="flex flex-1 flex-col items-center px-5 pt-12 pb-16 sm:pt-16">
        <div className="w-full max-w-[400px]">
          <h1 className="text-center text-2xl font-bold tracking-tight text-black sm:text-[26px]">
            Welcome to Exness
          </h1>
          <div className="mt-10">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
