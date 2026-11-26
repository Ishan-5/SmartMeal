"use client";

import Link from "next/link";
import { ArrowLeft, Check, Leaf, LockKeyhole, ScanLine, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

import { HouseholdStep } from "@/components/household-step";
import { PlanStep } from "@/components/plan-step";
import { ScanStep } from "@/components/scan-step";
import { servingCount } from "@/lib/plan";
import type { AiMode } from "@/lib/ai";
import type { Household, Ingredient, MealPlan } from "@/lib/types";
import { cn, initialiseName } from "@/lib/utils";

type Step = 1 | 2 | 3;

const stepLabels = [
  { number: 1, label: "Scan", hint: "Your ingredients" },
  { number: 2, label: "Set", hint: "Your household" },
  { number: 3, label: "Plan", hint: "Your week" },
];

export default function WorkspacePage() {
  const [step, setStep] = useState<Step>(1);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [mode, setMode] = useState<AiMode | null>(null);
  const [note, setNote] = useState("");
  const [household, setHousehold] = useState<Household>({
    people: 2,
    portions: "regular",
    days: 7,
    focus: "protein",
  });
  const [plan, setPlan] = useState<MealPlan | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState<{ name: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data: { user?: { name: string } | null }) => setUser(data.user ?? null))
      .catch(() => undefined);
  }, []);

  async function generate() {
    setGenerating(true);
    setError("");
    try {
      const response = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients, household }),
      });
      const data = (await response.json()) as { plan?: MealPlan; mode?: AiMode; note?: string; error?: string };
      if (!response.ok || !data.plan) throw new Error(data.error ?? "Could not build your plan.");
      setPlan(data.plan);
      setMode(data.mode ?? "demo");
      setNote(data.note ?? "");
      setStep(3);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Something went wrong.");
    } finally {
      setGenerating(false);
    }
  }

  function reset() {
    setStep(1);
    setIngredients([]);
    setPreview(null);
    setMode(null);
    setNote("");
    setPlan(null);
    setError("");
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 z-40 border-b border-moss/10 bg-cream/85 backdrop-blur-xl">
        <div className="shell flex h-[70px] items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="grid h-9 w-9 place-items-center rounded-xl bg-moss text-paper" aria-label="SmartMeal home">
              <Leaf className="h-[18px] w-[18px]" />
            </Link>
            <div>
              <Link href="/" className="font-serif text-lg font-semibold leading-none">SmartMeal</Link>
              <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-muted">Workspace</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="hidden text-sm font-medium text-muted hover:text-moss sm:block">
              <span className="inline-flex items-center gap-1.5"><ArrowLeft className="h-4 w-4" /> Back to site</span>
            </Link>
            {user ? (
              <span className="grid h-9 w-9 place-items-center rounded-full bg-mint text-xs font-bold text-moss ring-1 ring-moss/15" aria-label={`Signed in as ${user.name}`}>
                {initialiseName(user.name)}
              </span>
            ) : (
              <Link href="/login?next=/app" className="btn-outline !px-4 !py-2 text-xs">Log in</Link>
            )}
          </div>
        </div>
      </header>

      <main className="shell py-10 lg:py-14">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow"><Sparkles className="h-3.5 w-3.5" /> SmartMeal demo</p>
            <h1 className="mt-5 font-serif text-3xl leading-tight tracking-tight sm:text-4xl">From photo to plan, in three steps.</h1>
            <p className="muted-text mt-3 max-w-xl text-sm">Try the full flow with your own photo or a sample fridge. Nothing is typed twice.</p>
          </div>
          {mode && (
            <span className={cn("rounded-full px-3 py-1.5 text-[11px] font-semibold", mode === "ai" ? "bg-mint text-moss" : "bg-sand text-moss")}>
              {mode === "ai" ? "AI connected" : "Demo mode · no key needed"}
            </span>
          )}
        </div>

        {/* Stepper */}
        <div className="mt-10 grid grid-cols-3 gap-2 sm:gap-4">
          {stepLabels.map((item) => {
            const active = step === item.number;
            const complete = step > item.number;
            return (
              <button
                key={item.number}
                type="button"
                disabled={item.number > step}
                onClick={() => setStep(item.number as Step)}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-all sm:px-5",
                  active ? "border-moss bg-paper shadow-card" : complete ? "border-moss/20 bg-mint/40" : "border-moss/10 bg-cream/50 opacity-60",
                )}
              >
                <span className={cn(
                  "grid h-9 w-9 shrink-0 place-items-center rounded-xl text-xs font-bold",
                  complete ? "bg-moss text-paper" : active ? "bg-mint text-moss" : "bg-sand text-muted",
                )}>
                  {complete ? <Check className="h-4 w-4" /> : item.number}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-ink">{item.label}</span>
                  <span className="hidden truncate text-[11px] text-muted sm:block">{item.hint}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <section className="panel p-5 sm:p-8">
            {error && (
              <div className="mb-6 rounded-2xl border border-clay/30 bg-clay/5 px-4 py-3 text-sm text-clay">{error}</div>
            )}
            {step === 1 && (
              <ScanStep
                ingredients={ingredients}
                setIngredients={setIngredients}
                preview={preview}
                setPreview={setPreview}
                mode={mode}
                setMode={setMode}
                note={note}
                setNote={setNote}
                onNext={() => setStep(2)}
              />
            )}
            {step === 2 && (
              <HouseholdStep
                household={household}
                setHousehold={setHousehold}
                ingredientCount={ingredients.length}
                onBack={() => setStep(1)}
                onGenerate={() => void generate()}
                loading={generating}
              />
            )}
            {step === 3 && plan && (
              <PlanStep
                plan={plan}
                household={household}
                ingredients={ingredients}
                mode={mode}
                note={note}
                user={user}
                onBack={() => setStep(2)}
                onReset={reset}
              />
            )}
          </section>

          <aside className="space-y-4">
            <div className="panel overflow-hidden">
              {preview ? (
                <img src={preview} alt="Your ingredient photo" className="h-36 w-full object-cover" />
              ) : (
                <div className="grid h-36 place-items-center bg-mint/50 text-moss"><ScanLine className="h-8 w-8 opacity-40" /></div>
              )}
              <div className="p-5">
                <p className="field-label">Your snapshot</p>
                <div className="mt-3 space-y-2.5 text-sm">
                  <div className="flex justify-between gap-3"><span className="text-muted">Ingredients</span><span className="font-semibold text-ink">{ingredients.length}</span></div>
                  <div className="flex justify-between gap-3"><span className="text-muted">Household</span><span className="font-semibold text-ink">{household.people} {household.people === 1 ? "person" : "people"}</span></div>
                  <div className="flex justify-between gap-3"><span className="text-muted">Servings / meal</span><span className="font-semibold text-ink">{servingCount(household)}</span></div>
                  <div className="flex justify-between gap-3"><span className="text-muted">Days</span><span className="font-semibold text-ink">{household.days}</span></div>
                  <div className="flex justify-between gap-3"><span className="text-muted">Plan ready</span><span className="font-semibold text-ink">{plan ? "Yes" : "Not yet"}</span></div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-moss/10 bg-mint/40 p-5">
              <p className="font-serif text-lg text-moss">A calmer way to plan</p>
              <ol className="mt-3 space-y-3 text-xs leading-relaxed text-muted">
                <li><span className="font-bold text-ink">01</span> Scan what is already in your kitchen.</li>
                <li><span className="font-bold text-ink">02</span> Tell us your people, portions and days.</li>
                <li><span className="font-bold text-ink">03</span> Cook the plan, buy only the gaps.</li>
              </ol>
            </div>

            <div className="flex items-start gap-3 rounded-3xl border border-moss/10 bg-paper p-5">
              <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-moss" />
              <p className="text-xs leading-relaxed text-muted">
                Your photo is resized in your browser. With no AI key installed, recognition and planning run locally in demo mode.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
