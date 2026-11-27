import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Camera,
  Check,
  ChefHat,
  Clock3,
  HeartPulse,
  Leaf,
  ScanLine,
  ShoppingBasket,
  Sparkles,
  Users,
} from "lucide-react";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WaitlistForm } from "@/components/waitlist-form";
import { pageMeta } from "@/lib/page-meta";

export const metadata: Metadata = pageMeta({
  title: "Snap. Plan. Eat well.",
  description:
    "Photograph your fridge, set your household, and get a protein-forward weekly meal plan with an exact grocery list.",
  path: "/",
});

const recognised = ["Eggs", "Spinach", "Chicken", "Greek yogurt"];

const weekPreview = [
  { day: "Mon", meal: "Lemon chicken bowls", protein: 42 },
  { day: "Tue", meal: "Herby egg skillet", protein: 31 },
  { day: "Wed", meal: "Greek yogurt flatbreads", protein: 28 },
];

const steps = [
  {
    number: "01",
    title: "Scan",
    subtitle: "Snap your ingredients",
    description: "Photograph your fridge, pantry, or grocery haul. SmartMeal recognizes what is ready to use.",
    icon: Camera,
    detail: ["Fridge photo", "Pantry shelf", "Grocery haul"],
  },
  {
    number: "02",
    title: "Set",
    subtitle: "Set your household",
    description: "Tell us how many people are eating, your portions, and how many days you want covered.",
    icon: Users,
    detail: ["4 people", "Regular portions", "7 days"],
  },
  {
    number: "03",
    title: "Cook",
    subtitle: "Cook with a clear plan",
    description: "Receive protein-rich meals and a grocery list with quantities that make sense.",
    icon: ChefHat,
    detail: ["Weekly plan", "Exact quantities", "Less waste"],
  },
];

const features = [
  {
    title: "Ingredient recognition",
    description: "Turn a quick photo into a usable inventory, without typing every item.",
    icon: ScanLine,
    meta: "Spinach · Chicken · Eggs",
  },
  {
    title: "Weekly meal planning",
    description: "A flexible plan built around your time, household, and what you already have.",
    icon: CalendarDays,
    meta: "3, 5 or 7 days",
  },
  {
    title: "Protein-forward by default",
    description: "Balanced meals that help you make protein a simple part of every day.",
    icon: HeartPulse,
    meta: "28–45g per meal",
  },
  {
    title: "Exact grocery quantities",
    description: "Know whether you need 500g of tomatoes or 1kg of chicken before you shop.",
    icon: ShoppingBasket,
    meta: "Only buy the gaps",
  },
  {
    title: "Household-aware portions",
    description: "Small, regular or large — every quantity is scaled to the people actually eating.",
    icon: Sparkles,
    meta: "Exact servings, every time",
  },
];

export default function Home() {
  return (
    <>
      <SiteHeader />

      <main id="main-content">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 grain opacity-60" />
          <div className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-mint/60 blur-3xl" />
          <div className="shell relative grid items-center gap-14 py-14 lg:grid-cols-[1.02fr_0.98fr] lg:py-24">
            <div className="animate-fade-up">
              <p className="eyebrow">
                <Sparkles className="h-3.5 w-3.5" /> SmartMeal · your AI kitchen assistant
              </p>
              <h1 className="mt-7 font-serif text-[2.45rem] leading-[1.05] tracking-tight text-ink sm:text-6xl lg:text-[4.35rem]">
                Snap your ingredients. Get a week of{" "}
                <span className="relative text-moss sm:whitespace-nowrap">
                  meal plans.
                  <svg className="absolute -bottom-2 left-0 w-full" height="12" viewBox="0 0 240 12" fill="none" preserveAspectRatio="none" aria-hidden="true">
                    <path d="M3 9C60 3 160 3 237 7" stroke="#8CA898" strokeWidth="5" strokeLinecap="round" />
                  </svg>
                </span>
              </h1>
              <p className="muted-text mt-8 max-w-xl text-base sm:text-lg">
                Turn a quick photo of your fridge, pantry, or grocery haul into a personalized plan that fits your people, portions, and real-life schedule.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Link href="/app" className="btn-primary">
                  Try SmartMeal free <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="#waitlist" className="btn-outline">
                  Join the waitlist <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <p className="mt-4 text-xs font-medium text-muted">No card. No sign-up needed to try the full flow.</p>
              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-medium text-muted">
                <span className="flex items-center gap-2"><Check className="h-4 w-4 text-moss" /> No typing ingredients</span>
                <span className="flex items-center gap-2"><Check className="h-4 w-4 text-moss" /> No food waste</span>
                <span className="flex items-center gap-2"><Check className="h-4 w-4 text-moss" /> Real grocery quantities</span>
              </div>
            </div>

            {/* Hero visual */}
            <div className="relative mx-auto w-full max-w-[560px] animate-fade-up [animation-delay:120ms]">
              <div className="panel overflow-hidden p-3 sm:p-4">
                <div className="relative overflow-hidden rounded-[26px] bg-mint">
                  <img
                    src="/images/Mainimage.png"
                    alt="Fresh vegetables, eggs, grains and pantry ingredients ready for meal planning"
                    width={1216}
                    height={833}
                    loading="eager"
                    className="block h-auto w-full"
                  />
                </div>
              </div>

              <div className="absolute left-2 top-3 w-[164px] rounded-2xl border border-moss/10 bg-paper/95 p-3 shadow-soft backdrop-blur sm:-left-8 sm:top-10 sm:w-[210px]">
                <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-moss">
                  <ScanLine className="h-3.5 w-3.5" /> Recognized
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {recognised.map((item) => (
                    <span key={item} className="rounded-full bg-mint px-2.5 py-1 text-[11px] font-semibold text-moss">{item}</span>
                  ))}
                </div>
              </div>

              <div className="absolute bottom-2 right-2 w-[214px] rounded-3xl border border-moss/10 bg-paper p-4 shadow-soft sm:-bottom-8 sm:-right-8 sm:w-[286px]">
                <div className="flex items-center justify-between">
                  <p className="font-serif text-lg text-ink">This week</p>
                  <span className="rounded-full bg-mint px-2 py-1 text-[10px] font-semibold text-moss">Protein-forward</span>
                </div>
                <div className="mt-3 space-y-2.5">
                  {weekPreview.map((row) => (
                    <div key={row.day} className="flex items-center gap-2.5">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-cream text-[10px] font-bold text-moss">{row.day}</span>
                      <span className="flex-1 truncate text-[12px] font-medium text-ink">{row.meal}</span>
                      <span className="text-[11px] font-semibold text-clay">{row.protein}g</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="shell pb-16 pt-10 lg:pb-20">
            <div className="flex flex-col items-start justify-between gap-4 border-y border-moss/10 py-6 sm:flex-row sm:items-center">
              <p className="font-serif text-xl text-moss sm:text-2xl">Built for real kitchens, real schedules.</p>
              <p className="muted-text max-w-md text-sm">Healthy home cooking should not feel like another job.</p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="scroll-mt-24 py-20 lg:py-28">
          <div className="shell">
            <div className="max-w-2xl">
              <p className="eyebrow">01 / How it works</p>
              <h2 className="section-title mt-5">From kitchen snapshot to a week that feels handled.</h2>
              <p className="muted-text mt-5">Three small steps between &ldquo;what&rsquo;s for dinner?&rdquo; and a plan you can actually cook.</p>
            </div>

            <div className="relative mt-12 grid gap-5 md:grid-cols-3">
              <div className="pointer-events-none absolute left-[16%] right-[16%] top-12 hidden border-t border-dashed border-moss/20 md:block" />
              {steps.map((step) => (
                <article key={step.number} className="panel relative p-7 transition-transform duration-300 hover:-translate-y-1">
                  <div className="flex items-center justify-between">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-mint text-moss">
                      <step.icon className="h-5 w-5" strokeWidth={1.9} />
                    </span>
                    <span className="font-serif text-3xl text-sand">{step.number}</span>
                  </div>
                  <p className="mt-7 text-[11px] font-bold uppercase tracking-[0.18em] text-clay">{step.title}</p>
                  <h3 className="mt-2 font-serif text-2xl text-ink">{step.subtitle}</h3>
                  <p className="muted-text mt-3 text-sm">{step.description}</p>
                  <div className="mt-6 flex flex-wrap gap-1.5 border-t border-moss/10 pt-5">
                    {step.detail.map((item) => (
                      <span key={item} className="rounded-full bg-cream px-2.5 py-1 text-[11px] font-medium text-muted">{item}</span>
                    ))}
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                { title: "Use what you have", body: "Start with the ingredients already in your kitchen." },
                { title: "Eat protein-rich meals", body: "Plans are built around satisfying, nourishing choices." },
                { title: "Buy only what you need", body: "Get exact quantities for the gaps in your plan." },
              ].map((item, index) => (
                <div key={item.title} className="flex items-start gap-3 rounded-2xl bg-mint/50 px-5 py-4">
                  <span className="font-serif text-lg text-moss">0{index + 1}</span>
                  <div>
                    <p className="text-sm font-semibold text-ink">{item.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="scroll-mt-24 bg-paper/70 py-20 lg:py-28">
          <div className="shell">
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <div className="max-w-2xl">
                <p className="eyebrow">02 / Features</p>
                <h2 className="section-title mt-5">Kitchen intelligence, made useful.</h2>
              </div>
              <p className="muted-text max-w-sm text-sm">The small details that make dinner easier.</p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <article key={feature.title} className="group rounded-4xl border border-moss/10 bg-paper p-7 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-soft">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-mint text-moss transition-colors group-hover:bg-moss group-hover:text-paper">
                    <feature.icon className="h-5 w-5" strokeWidth={1.9} />
                  </div>
                  <h3 className="mt-6 font-serif text-xl text-ink">{feature.title}</h3>
                  <p className="muted-text mt-2 text-sm">{feature.description}</p>
                  <p className="mt-6 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-moss/70">
                    <span className="h-1.5 w-1.5 rounded-full bg-clay" /> {feature.meta}
                  </p>
                </article>
              ))}

              <article className="relative overflow-hidden rounded-4xl bg-moss p-7 text-paper shadow-card">
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full border border-paper/10" />
                <div className="absolute -bottom-16 right-12 h-48 w-48 rounded-full border border-paper/10" />
                <Clock3 className="h-5 w-5 text-mint" />
                <h3 className="mt-6 font-serif text-xl">Ready for tonight</h3>
                <p className="mt-2 text-sm leading-relaxed text-paper/70">
                  Filter by minutes, not just macros. SmartMeal keeps the plan realistic for a Tuesday.
                </p>
                <Link href="/app" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-mint hover:gap-3 transition-all">
                  Try it yourself <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            </div>
          </div>
        </section>

        {/* Story */}
        <section id="our-story" className="scroll-mt-24 py-20 lg:py-28">
          <div className="shell grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <div className="relative">
              <div className="panel overflow-hidden p-3">
                <div className="overflow-hidden rounded-[26px] bg-mint">
                  <img
                    src="/images/image.png"
                    alt="Fresh ingredients being prepared in a warm home kitchen"
                    width={1107}
                    height={835}
                    loading="lazy"
                    className="block h-auto w-full"
                  />
                </div>
              </div>
              <div className="absolute -bottom-6 -right-2 rounded-2xl border border-moss/10 bg-paper px-5 py-4 shadow-soft sm:-right-6">
                <p className="font-serif text-lg text-moss">More time around the table.</p>
                <p className="mt-1 text-xs text-muted">Less time deciding what to cook.</p>
              </div>
            </div>

            <div>
              <p className="eyebrow">03 / Our story</p>
              <h2 className="section-title mt-5">Made for the 5pm question.</h2>
              <p className="muted-text mt-6 text-base">
                Healthy home cooking should not feel like another job. SmartMeal was created for the moments when you want to cook something good, but the fridge is full of possibilities and your brain is already full.
              </p>
              <p className="muted-text mt-4 text-base">
                We make the planning part lighter, so you can spend more time around the table.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="#waitlist" className="btn-primary">Meet SmartMeal <ArrowRight className="h-4 w-4" /></Link>
                <span className="rounded-full border border-moss/15 px-4 py-2 text-xs font-semibold text-moss">Early access</span>
              </div>
              <div className="mt-10 grid grid-cols-2 gap-4 border-t border-moss/10 pt-8 sm:grid-cols-3">
                {[
                  { value: "7", label: "days planned" },
                  { value: "42g", label: "protein on Monday" },
                  { value: "0", label: "duplicate shopping" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="font-serif text-3xl text-moss">{stat.value}</p>
                    <p className="mt-1 text-xs text-muted">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-24 bg-paper/70 py-20 lg:py-24">
          <div className="shell grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div>
              <p className="eyebrow">04 / Good to know</p>
              <h2 className="section-title mt-5">A few quick answers.</h2>
              <p className="muted-text mt-5 text-sm">Everything you need to decide if SmartMeal fits your kitchen.</p>
            </div>
            <div className="divide-y divide-moss/10 rounded-4xl border border-moss/10 bg-paper px-6 shadow-card sm:px-8">
              {[
                {
                  q: "Is SmartMeal really free?",
                  a: "Yes. You can use the full scan → plan → shopping list flow for free, without an account. An account is optional and lets you save plans for later.",
                },
                {
                  q: "Do I need to type in every ingredient?",
                  a: "No. Upload a photo of your fridge or pantry and the AI reads what it can see. You can edit, add or remove anything before planning — and there is a sample fridge if you just want to look around.",
                },
                {
                  q: "What if the AI gets something wrong?",
                  a: "Every recognised item is editable. If a service is unavailable, SmartMeal automatically falls back to its local planning engine, so the app keeps working instead of showing an error.",
                },
                {
                  q: "Why am I still buying some ingredients?",
                  a: "A plan can only use what you have. If you have vegetables but no protein source, the shopping list includes the missing protein. Quantities are calculated from your household size and portion setting — you only buy the gaps.",
                },
                {
                  q: "Are my photos stored?",
                  a: "No. Photos are resized in your browser, sent to the AI provider for recognition, and never written to our database. Saved plans store ingredients and settings, not the image itself.",
                },
              ].map((item) => (
                <details key={item.q} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-ink marker:hidden">
                    {item.q}
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-mint text-moss transition-transform group-open:rotate-45" aria-hidden="true">+</span>
                  </summary>
                  <p className="muted-text mt-3 pr-8 text-sm">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Waitlist */}
        <section id="waitlist" className="scroll-mt-24 pb-20 pt-4 lg:pb-28">
          <div className="shell">
            <div className="relative overflow-hidden rounded-4xl bg-moss px-6 py-14 text-paper shadow-soft sm:px-12 lg:px-16 lg:py-20">
              <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full border border-paper/10" />
              <div className="pointer-events-none absolute -right-4 -top-10 h-72 w-72 rounded-full border border-paper/10" />
              <Leaf className="absolute right-12 top-12 h-10 w-10 text-paper/10" />
              <div className="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                <div>
                  <p className="inline-flex items-center gap-2 rounded-full bg-paper/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-mint">
                    <Sparkles className="h-3.5 w-3.5" /> Early access
                  </p>
                  <h2 className="mt-6 max-w-xl font-serif text-3xl leading-tight sm:text-4xl lg:text-[3rem]">
                    Let dinner feel a little more sorted.
                  </h2>
                  <p className="mt-5 max-w-lg text-sm leading-relaxed text-paper/70">
                    Join the waitlist for first access to SmartMeal and a calmer way to plan protein-rich meals.
                  </p>
                </div>
                <div className="lg:pl-8">
                  <WaitlistForm source="website" compact />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
