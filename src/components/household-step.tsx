"use client";

import { ArrowLeft, ArrowRight, LoaderCircle, Minus, Plus, Sparkles, Users } from "lucide-react";

import { servingCount } from "@/lib/plan";
import type { Household, PortionSize, PlanFocus } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  household: Household;
  setHousehold: (value: Household) => void;
  ingredientCount: number;
  onBack: () => void;
  onGenerate: () => void;
  loading: boolean;
}

const portions: Array<{ value: PortionSize; label: string; hint: string }> = [
  { value: "small", label: "Small", hint: "Lighter servings" },
  { value: "regular", label: "Regular", hint: "Everyday portions" },
  { value: "large", label: "Large", hint: "Big appetites" },
];

const focuses: Array<{ value: PlanFocus; label: string; hint: string }> = [
  { value: "protein", label: "Protein-first", hint: "28–45g per meal" },
  { value: "balanced", label: "Balanced", hint: "A bit of everything" },
  { value: "quick", label: "Quick", hint: "Under 20 minutes" },
];

export function HouseholdStep({ household, setHousehold, ingredientCount, onBack, onGenerate, loading }: Props) {
  const patch = (values: Partial<Household>) => setHousehold({ ...household, ...values });
  const servings = servingCount(household);

  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-clay">Step 02</p>
      <h2 className="mt-2 font-serif text-3xl text-ink">Set your household</h2>
      <p className="muted-text mt-2 text-sm">A plan that fits your people, portions and real-life schedule.</p>

      <div className="mt-9 space-y-9">
        <div>
          <p className="field-label">How many people are eating?</p>
          <div className="flex max-w-xs items-center justify-between rounded-2xl border border-moss/15 bg-paper p-2">
            <button
              type="button"
              onClick={() => patch({ people: Math.max(1, household.people - 1) })}
              className="grid h-10 w-10 place-items-center rounded-xl bg-cream text-moss transition-colors hover:bg-mint disabled:opacity-30"
              disabled={household.people <= 1}
              aria-label="One fewer person"
            >
              <Minus className="h-4 w-4" />
            </button>
            <div className="text-center">
              <p className="font-serif text-3xl text-ink">{household.people}</p>
              <p className="text-[11px] text-muted">{household.people === 1 ? "person" : "people"}</p>
            </div>
            <button
              type="button"
              onClick={() => patch({ people: Math.min(12, household.people + 1) })}
              className="grid h-10 w-10 place-items-center rounded-xl bg-cream text-moss transition-colors hover:bg-mint disabled:opacity-30"
              disabled={household.people >= 12}
              aria-label="One more person"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div>
          <p className="field-label">Portion size</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {portions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => patch({ portions: option.value })}
                className={cn(
                  "rounded-2xl border p-4 text-left transition-all",
                  household.portions === option.value
                    ? "border-moss bg-mint/70 shadow-card"
                    : "border-moss/15 bg-paper hover:border-moss/40",
                )}
              >
                <p className="text-sm font-semibold text-ink">{option.label}</p>
                <p className="mt-1 text-xs text-muted">{option.hint}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="field-label">Days to cover</p>
          <div className="flex flex-wrap gap-2">
            {[3, 5, 7].map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => patch({ days })}
                className={cn(
                  "rounded-full px-5 py-2.5 text-sm font-semibold transition-all",
                  household.days === days ? "bg-moss text-paper" : "bg-cream text-muted hover:bg-mint",
                )}
              >
                {days} days
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="field-label">What matters most?</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {focuses.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => patch({ focus: option.value })}
                className={cn(
                  "rounded-2xl border p-4 text-left transition-all",
                  household.focus === option.value
                    ? "border-moss bg-mint/70 shadow-card"
                    : "border-moss/15 bg-paper hover:border-moss/40",
                )}
              >
                <p className="text-sm font-semibold text-ink">{option.label}</p>
                <p className="mt-1 text-xs text-muted">{option.hint}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-9 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-mint/60 p-5">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-paper text-moss"><Users className="h-5 w-5" /></span>
          <div>
            <p className="text-sm font-semibold text-ink">
              {household.days} days · {household.people} {household.people === 1 ? "person" : "people"}
            </p>
            <p className="text-xs text-muted">About {servings} {servings === 1 ? "serving" : "servings"} per meal, from {ingredientCount} ingredients</p>
          </div>
        </div>
        <Sparkles className="h-5 w-5 text-moss/40" />
      </div>

      <div className="mt-8 flex flex-wrap justify-between gap-3">
        <button type="button" onClick={onBack} className="btn-outline"><ArrowLeft className="h-4 w-4" /> Back to scan</button>
        <button type="button" onClick={onGenerate} disabled={loading || !ingredientCount} className="btn-primary disabled:cursor-not-allowed disabled:opacity-40">
          {loading ? <><LoaderCircle className="h-4 w-4 animate-spin" /> Building your plan…</> : <>Build my week <ArrowRight className="h-4 w-4" /></>}
        </button>
      </div>
    </div>
  );
}
