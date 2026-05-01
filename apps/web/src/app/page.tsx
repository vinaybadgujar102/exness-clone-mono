import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col bg-white font-sans text-neutral-900 antialiased">
      <main className="flex flex-1 flex-col items-center px-6 pt-16 pb-8 sm:pt-24">
        <h1 className="text-3xl font-bold tracking-tight text-black sm:text-4xl">
          exness
        </h1>
        <p className="mt-6 max-w-md text-center text-[15px] leading-relaxed text-neutral-500 sm:text-base">
          Please sign in or register for full access to Exness content and
          services.
        </p>
        <div className="mt-10 flex w-full max-w-[280px] flex-col gap-3">
          <Link
            href="/login"
            className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-[#FFD700] text-[15px] font-medium text-black transition hover:brightness-[0.98] active:brightness-95"
          >
            Sign in
          </Link>
          <Link
            href="/login"
            className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-[#F0F0F0] text-[15px] font-medium text-black transition hover:bg-[#E8E8E8] active:bg-[#E0E0E0]"
          >
            Register
          </Link>
        </div>
        <a
          href="mailto:support@exness.com"
          className="mt-10 text-sm text-neutral-600 underline underline-offset-2 transition hover:text-neutral-900"
        >
          support@exness.com
        </a>
      </main>

      <footer className="mt-auto border-t border-neutral-200 px-6 py-6">
        <p className="mx-auto max-w-2xl text-center text-xs leading-relaxed text-neutral-500 sm:text-[13px]">
          Vanvest Limited is registered and regulated by the Financial Services
          Commission of the Republic of Vanuatu under registration number
          700276.
        </p>
      </footer>
    </div>
  );
}
