import Link from "next/link";
import { ArrowLeft, Compass, Sparkles } from "lucide-react";

import { MarketingShell } from "@/components/marketing-shell";

export default function NotFound() {
  return (
    <MarketingShell>
      <main id="main-content" className="grid min-h-[65vh] place-items-center px-5 py-16">
        <div className="panel w-full max-w-xl p-8 text-center sm:p-12">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-mint text-moss">
            <Compass className="h-6 w-6" />
          </span>
          <p className="mt-6 font-serif text-6xl text-sand">404</p>
          <h1 className="mt-3 font-serif text-3xl text-ink">This page is not on the menu</h1>
          <p className="muted-text mx-auto mt-3 max-w-sm text-sm">
            The link may be old, or the page may have moved. Your ingredients are safe wherever you left them.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/" className="btn-primary"><ArrowLeft className="h-4 w-4" /> Back to SmartMeal</Link>
            <Link href="/app" className="btn-outline"><Sparkles className="h-4 w-4" /> Open the app</Link>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-x-5 gap-y-2 border-t border-moss/10 pt-6 text-xs text-muted">
            <Link href="/#faq" className="hover:text-moss">FAQ</Link>
            <Link href="/privacy" className="hover:text-moss">Privacy</Link>
            <Link href="/terms" className="hover:text-moss">Terms</Link>
          </div>
        </div>
      </main>
    </MarketingShell>
  );
}
