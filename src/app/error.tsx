"use client";

import { RotateCcw } from "lucide-react";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main id="main-content" className="grid min-h-screen place-items-center bg-cream px-5">
      <div className="panel max-w-md p-8 text-center sm:p-10">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-mint text-moss">🍽️</span>
        <h1 className="mt-6 font-serif text-3xl text-ink">Something went wrong</h1>
        <p className="muted-text mt-3 text-sm">
          That usually passes. Try again — your ingredients and household settings are still safe in this browser.
        </p>
        <button type="button" onClick={reset} className="btn-primary mt-7">
          <RotateCcw className="h-4 w-4" /> Try again
        </button>
      </div>
    </main>
  );
}
