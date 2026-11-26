import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Leaf } from "lucide-react";

export const metadata: Metadata = { title: "Terms" };

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
    <main id="main-content" className="min-h-screen bg-cream">
      <div className="shell max-w-3xl py-14 sm:py-20">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-moss">
          <ArrowLeft className="h-4 w-4" /> Back to SmartMeal
        </Link>
        <div className="mt-10 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-moss text-paper"><Leaf className="h-5 w-5" /></span>
          <span className="font-serif text-2xl font-semibold">SmartMeal</span>
        </div>
        <h1 className="mt-8 font-serif text-4xl tracking-tight text-ink sm:text-5xl">Terms of use</h1>
        <p className="muted-text mt-4 text-sm">Last updated 27 November 2026.</p>
        <div className="panel mt-10 divide-y divide-moss/10 px-6 sm:px-10">
          {sections.map((section) => (
            <section key={section.title} className="py-7">
              <h2 className="font-serif text-xl text-ink">{section.title}</h2>
              <p className="muted-text mt-3 text-sm">{section.body}</p>
            </section>
          ))}
        </div>
        <p className="muted-text mt-8 text-sm">
          Questions? See the <Link href="/privacy" className="font-semibold text-moss hover:underline">privacy policy</Link>.
        </p>
      </div>
    </main>
  );
}
