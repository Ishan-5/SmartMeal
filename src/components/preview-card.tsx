"use client";

import Link from "next/link";
import { ArrowRight, Clock3, HeartPulse, Sparkles } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

const previews = [
  {
    day: "Mon",
    meal: "Lemon chicken bowls",
    protein: 42,
    minutes: 25,
    emoji: "🍋",
    note: "Uses the chicken and spinach already in your fridge.",
  },
  {
    day: "Tue",
    meal: "Herby egg skillet",
    protein: 31,
    minutes: 15,
    emoji: "🍳",
    note: "A fast, protein-rich dinner with almost no shopping.",
  },
  {
    day: "Wed",
    meal: "Greek yogurt flatbreads",
    protein: 28,
    minutes: 20,
    emoji: "🥙",
    note: "Flatbreads, yogurt and herbs become a proper meal.",
  },
];

export function PreviewCard() {
  const [active, setActive] = useState(0);
  const preview = previews[active];

  return (
    <div className="absolute bottom-2 right-2 w-[214px] rounded-3xl border border-moss/10 bg-paper p-4 shadow-soft sm:-bottom-8 sm:-right-8 sm:w-[286px]">
      <div className="flex items-center justify-between">
        <p className="font-serif text-lg text-ink">This week</p>
        <span className="rounded-full bg-mint px-2 py-1 text-[10px] font-semibold text-moss">Protein-forward</span>
      </div>

      <div className="mt-3 flex gap-1.5" role="tablist" aria-label="Preview days">
        {previews.map((item, index) => (
          <button
            key={item.day}
            type="button"
            role="tab"
            aria-selected={active === index}
            onClick={() => setActive(index)}
            className={cn(
              "flex-1 rounded-lg py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] transition-colors",
              active === index ? "bg-moss text-paper" : "bg-cream text-muted hover:bg-mint hover:text-moss",
            )}
          >
            {item.day}
          </button>
        ))}
      </div>

      <div className="mt-3 rounded-2xl bg-cream/70 p-3" role="tabpanel">
        <div className="flex items-start gap-2.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-paper text-lg">{preview.emoji}</span>
          <div className="min-w-0">
            <p className="truncate font-serif text-sm text-ink">{preview.meal}</p>
            <div className="mt-1 flex items-center gap-2 text-[10px] text-muted">
              <span className="inline-flex items-center gap-1"><Clock3 className="h-3 w-3" /> {preview.minutes} min</span>
              <span className="inline-flex items-center gap-1 text-clay"><HeartPulse className="h-3 w-3" /> {preview.protein}g</span>
            </div>
          </div>
        </div>
        <p className="mt-2 text-[10px] leading-relaxed text-muted">{preview.note}</p>
      </div>

      <Link href="/app" className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-moss hover:gap-2.5 transition-all">
        <Sparkles className="h-3 w-3" /> Build a full week <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}
