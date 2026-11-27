import type { Metadata } from "next";
import Link from "next/link";
import { Check, FileText } from "lucide-react";

import { MarketingShell } from "@/components/marketing-shell";
import { pageMeta } from "@/lib/page-meta";

export const metadata: Metadata = pageMeta({
  title: "Terms",
  description: "The terms for using the free SmartMeal meal planner.",
  path: "/terms",
});

const highlights = ["Free to use", "You own your plans", "Check AI before you cook"];

const sections = [
  {
    title: "A free tool",
    body: "SmartMeal is offered free of charge, with no paid plan or subscription. We may change or discontinue features without notice. You do not need an account to try the full flow; an account simply lets you save plans.",
  },
  {
    title: "AI can make mistakes",
    body: "Ingredient recognition and recipe generation use AI. Always check the recognised inventory, cooking steps, quantities and allergens before shopping or eating. SmartMeal is a planning aid, not medical or nutritional advice.",
  },
  {
    title: "Your content",
    body: "You retain ownership of the ingredients, settings and plans you enter. You give SmartMeal permission to process them only to provide the service. Do not upload photos containing people, private documents or anything you do not have the right to share.",
  },
  {
    title: "Fair use",
    body: "Do not abuse the service, attempt to bypass rate limits, scrape other users' data, or use automated scripts to create accounts or join the waitlist. We may block traffic that puts the free infrastructure at risk.",
  },
  {
    title: "Availability and liability",
    body: "The service depends on free third-party providers and may be temporarily unavailable when those providers are busy or rate-limited. SmartMeal automatically falls back to its local planning engine. To the fullest extent permitted by law, SmartMeal is provided as-is without warranties.",
  },
];

export default function TermsPage() {
  return (
    <MarketingShell>
      <main id="main-content" className="py-14 sm:py-20">
        <div className="shell max-w-3xl">
          <p className="eyebrow"><FileText className="h-3.5 w-3.5" /> Legal · Terms</p>
          <h1 className="mt-6 font-serif text-4xl tracking-tight text-ink sm:text-5xl">Terms of use</h1>
          <p className="muted-text mt-4 text-sm">Last updated 27 November 2026. The short version: use it kindly, cook safely.</p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {highlights.map((item) => (
              <div key={item} className="flex items-center gap-2 rounded-2xl border border-moss/10 bg-paper px-4 py-3 text-xs font-semibold text-ink">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-mint text-moss"><Check className="h-3 w-3" strokeWidth={3} /></span>
                {item}
              </div>
            ))}
          </div>

          <nav aria-label="Terms sections" className="mt-8 flex flex-wrap gap-2">
            {sections.map((section, index) => (
              <a
                key={section.title}
                href={`#terms-${index + 1}`}
                className="rounded-full border border-moss/15 bg-paper px-3 py-1.5 text-[11px] font-semibold text-muted transition-colors hover:border-moss/40 hover:text-moss"
              >
                {String(index + 1).padStart(2, "0")} {section.title}
              </a>
            ))}
          </nav>

          <div className="panel mt-8 divide-y divide-moss/10 px-6 sm:px-10">
            {sections.map((section, index) => (
              <section key={section.title} id={`terms-${index + 1}`} className="scroll-mt-24 py-7">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-clay">0{index + 1}</p>
                <h2 className="mt-2 font-serif text-xl text-ink">{section.title}</h2>
                <p className="muted-text mt-3 text-sm">{section.body}</p>
              </section>
            ))}
          </div>

          <p className="muted-text mt-8 text-sm">
            Questions? See the <Link href="/privacy" className="font-semibold text-moss hover:underline">privacy policy</Link>.
          </p>
        </div>
      </main>
    </MarketingShell>
  );
}
