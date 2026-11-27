import Link from "next/link";
import { ArrowRight, Check, Leaf, LockKeyhole, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  mode: "login" | "signup";
}

const highlights = [
  "Use up the food you already have",
  "Protein-forward plans for real weeks",
  "Reopen saved plans whenever you need",
];

const brandCopy = {
  login: {
    eyebrow: "Your plans are waiting",
    headline: (
      <>
        Good food, <span className="text-moss">already planned.</span>
      </>
    ),
    description:
      "Log in to pick up your saved ingredients, household settings and grocery lists exactly where you left them.",
  },
  signup: {
    eyebrow: "Your kitchen, organised",
    headline: (
      <>
        From fridge photo <span className="text-moss">to dinner plan.</span>
      </>
    ),
    description:
      "Create a free account to save the weekly plans you love, then come back whenever the 5pm question shows up.",
  },
};

export function AuthShell({ children, mode }: Props) {
  const copy = brandCopy[mode];

  return (
    <main id="main-content" className="relative min-h-screen overflow-hidden bg-cream">
      <div aria-hidden="true" className="pointer-events-none absolute -left-40 -top-48 h-[34rem] w-[34rem] rounded-full bg-mint/50 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-64 -right-40 h-[36rem] w-[36rem] rounded-full bg-[#E8DCC5]/40 blur-3xl" />

      <div className="shell relative grid min-h-screen items-center gap-10 py-10 sm:py-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
        <aside className="hidden lg:block">
          <Link href="/" className="inline-flex items-center gap-2.5" aria-label="SmartMeal home">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-moss text-paper shadow-card">
              <Leaf className="h-5 w-5" strokeWidth={2.2} />
            </span>
            <span className="font-serif text-2xl font-semibold tracking-tight">SmartMeal</span>
          </Link>

          <div className="mt-14 max-w-xl">
            <p className="eyebrow">
              <Sparkles className="h-3.5 w-3.5" /> {copy.eyebrow}
            </p>
            <p className="mt-6 font-serif text-[3.35rem] leading-[1.06] tracking-tight text-ink">
              {copy.headline}
            </p>
            <p className="muted-text mt-6 max-w-lg text-lg">{copy.description}</p>

            <ul className="mt-10 space-y-3">
              {highlights.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm font-medium text-ink">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-mint text-moss">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <Link href="/app" className="btn-light mt-10">
              Open the free demo <ArrowRight className="h-4 w-4" />
            </Link>

            <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-muted">
              <span className="inline-flex items-center gap-1.5">
                <LockKeyhole className="h-3.5 w-3.5 text-moss" /> Secure session
              </span>
              <span>No card needed</span>
              <span>Your plans stay yours</span>
            </div>
          </div>

          <p className="mt-14 font-serif text-xl text-moss">Snap. Plan. Eat well.</p>
        </aside>

        <section aria-label={mode === "login" ? "Log in to SmartMeal" : "Create your SmartMeal account"} className="mx-auto w-full max-w-md">
          <div className="mb-6 flex items-center justify-between gap-4 lg:hidden">
            <Link href="/" className="inline-flex items-center gap-2" aria-label="SmartMeal home">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-moss text-paper shadow-card">
                <Leaf className="h-[18px] w-[18px]" strokeWidth={2.2} />
              </span>
              <span className="font-serif text-xl font-semibold tracking-tight">SmartMeal</span>
            </Link>
            <Link href="/app" className="inline-flex items-center gap-1 text-xs font-semibold text-moss hover:underline">
              Try the demo <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {children}
        </section>
      </div>
    </main>
  );
}
