import type { Metadata } from "next";
import Link from "next/link";
import { Check, ShieldCheck } from "lucide-react";

import { MarketingShell } from "@/components/marketing-shell";
import { pageMeta } from "@/lib/page-meta";

export const metadata: Metadata = pageMeta({
  title: "Privacy",
  description: "What SmartMeal collects, how it is processed and the choices you have.",
  path: "/privacy",
});

const highlights = ["We never store your photos", "We do not sell your data", "Deletion available on request"];

const sections = [
  {
    title: "What we collect",
    body: "If you join the waitlist, we store your email address and the page you joined from. If you create an account, we store your name, email and a one-way password hash. When you build a plan, we store the ingredients and household settings needed to reopen it. Photos are resized in your browser and sent to the recognition provider; we do not save the image itself.",
  },
  {
    title: "How we use it",
    body: "We use your data to generate meal plans, keep you signed in, let you reopen saved plans, and export the waitlist as a CSV for launch announcements. We do not sell your data.",
  },
  {
    title: "Who processes it",
    body: "SmartMeal runs on Vercel, stores account and plan data in Supabase, and uses OpenRouter and Groq to recognise ingredients and generate plans. Those providers process only the data needed for each request.",
  },
  {
    title: "Cookies and retention",
    body: "A single httpOnly session cookie keeps you signed in for up to 30 days. Saved plans are limited to the 50 most recent per account. Session records expire automatically.",
  },
  {
    title: "Your choices",
    body: "You can use the full scan → plan → shopping list flow without an account. To ask for account deletion, plan deletion or a copy of your data, open an issue on the project repository linked in the footer and include the email address on the account. We will verify ownership before making changes.",
  },
];

export default function PrivacyPage() {
  return (
    <MarketingShell>
      <main id="main-content" className="py-14 sm:py-20">
        <div className="shell max-w-3xl">
          <p className="eyebrow"><ShieldCheck className="h-3.5 w-3.5" /> Legal · Privacy</p>
          <h1 className="mt-6 font-serif text-4xl tracking-tight text-ink sm:text-5xl">Privacy policy</h1>
          <p className="muted-text mt-4 text-sm">Last updated 27 November 2026. Plain language, no fine print tricks.</p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {highlights.map((item) => (
              <div key={item} className="flex items-center gap-2 rounded-2xl border border-moss/10 bg-paper px-4 py-3 text-xs font-semibold text-ink">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-mint text-moss"><Check className="h-3 w-3" strokeWidth={3} /></span>
                {item}
              </div>
            ))}
          </div>

          <nav aria-label="Privacy sections" className="mt-8 flex flex-wrap gap-2">
            {sections.map((section, index) => (
              <a
                key={section.title}
                href={`#privacy-${index + 1}`}
                className="rounded-full border border-moss/15 bg-paper px-3 py-1.5 text-[11px] font-semibold text-muted transition-colors hover:border-moss/40 hover:text-moss"
              >
                {String(index + 1).padStart(2, "0")} {section.title}
              </a>
            ))}
          </nav>

          <div className="panel mt-8 divide-y divide-moss/10 px-6 sm:px-10">
            {sections.map((section, index) => (
              <section key={section.title} id={`privacy-${index + 1}`} className="scroll-mt-24 py-7">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-clay">0{index + 1}</p>
                <h2 className="mt-2 font-serif text-xl text-ink">{section.title}</h2>
                <p className="muted-text mt-3 text-sm">{section.body}</p>
              </section>
            ))}
          </div>

          <p className="muted-text mt-8 text-sm">
            By using SmartMeal you agree to this policy and the <Link href="/terms" className="font-semibold text-moss hover:underline">terms of use</Link>.
          </p>
        </div>
      </main>
    </MarketingShell>
  );
}
