import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Leaf } from "lucide-react";

import { pageMeta } from "@/lib/page-meta";

export const metadata: Metadata = pageMeta({
  title: "Privacy",
  description: "What SmartMeal collects, how it is processed and the choices you have.",
  path: "/privacy",
});

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
    <main id="main-content" className="min-h-screen bg-cream">
      <div className="shell max-w-3xl py-14 sm:py-20">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-moss">
          <ArrowLeft className="h-4 w-4" /> Back to SmartMeal
        </Link>
        <div className="mt-10 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-moss text-paper"><Leaf className="h-5 w-5" /></span>
          <span className="font-serif text-2xl font-semibold">SmartMeal</span>
        </div>
        <h1 className="mt-8 font-serif text-4xl tracking-tight text-ink sm:text-5xl">Privacy policy</h1>
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
          By using SmartMeal you agree to this policy and the <Link href="/terms" className="font-semibold text-moss hover:underline">terms of use</Link>.
        </p>
      </div>
    </main>
  );
}
