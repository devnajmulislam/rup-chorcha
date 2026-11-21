"use client"

import Link from "next/link"

export default function GlobalError({
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-[#fff9f7] font-sans text-[#29232a] antialiased">
        <main className="mx-auto flex min-h-dvh max-w-xl items-center px-5 py-16">
          <div className="w-full rounded-3xl border border-[#3a1830]/15 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-xs font-semibold tracking-[0.22em] text-[#e50057] uppercase">
              RupChorcha
            </p>
            <h1 className="mt-2 font-serif text-3xl font-medium text-[#3a1830]">
              Something unexpected happened
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#5f5660]">
              We could not complete loading this page right now. Try refreshing
              the view or return to the RupChorcha homepage.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => retry()}
                className="inline-flex h-10 cursor-pointer items-center justify-center rounded-full bg-[#e50057] px-5 text-sm font-medium text-white transition-colors hover:bg-[#c8004c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e50057]"
              >
                Try again
              </button>
              <Link
                href="/"
                className="inline-flex h-10 items-center justify-center rounded-full border border-[#3a1830]/20 bg-white px-5 text-sm font-medium text-[#3a1830] transition-colors hover:bg-[#f7e4ea] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e50057]"
              >
                Return home
              </Link>
            </div>
          </div>
        </main>
      </body>
    </html>
  )
}
