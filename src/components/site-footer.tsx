import Link from "next/link";
import { Leaf } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-moss/10 bg-cream">
      <div className="shell grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-moss text-paper">
              <Leaf className="h-[18px] w-[18px]" />
            </span>
            <span className="font-serif text-xl font-semibold">SmartMeal</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
            Your AI kitchen assistant for effortless, protein-rich meals.
          </p>
          <p className="mt-6 font-serif text-lg text-moss">Snap. Plan. Eat well.</p>
        </div>

        <div>
          <p className="field-label">Explore</p>
          <div className="flex flex-col gap-3">
            <Link href="/#how-it-works" className="text-sm text-muted hover:text-moss">How it works</Link>
            <Link href="/#features" className="text-sm text-muted hover:text-moss">Features</Link>
            <Link href="/#our-story" className="text-sm text-muted hover:text-moss">Our story</Link>
            <Link href="/#faq" className="text-sm text-muted hover:text-moss">FAQ</Link>
            <Link href="/app" className="text-sm text-muted hover:text-moss">Try the demo</Link>
          </div>
        </div>

        <div>
          <p className="field-label">Start simply</p>
          <p className="mb-4 max-w-[240px] text-sm leading-relaxed text-muted">
            A calmer plan for the meals you already want to make.
          </p>
          <Link href="/#waitlist" className="btn-primary !px-5 !py-2.5">Get early access</Link>
        </div>
      </div>
      <div className="border-t border-moss/10">
        <div className="shell flex flex-col gap-2 py-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 SmartMeal. All rights reserved.</span>
          <span className="flex flex-wrap gap-4">
            <Link href="/privacy" className="hover:text-moss">Privacy</Link>
            <Link href="/terms" className="hover:text-moss">Terms</Link>
            <span>Built for real kitchens, real schedules.</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
