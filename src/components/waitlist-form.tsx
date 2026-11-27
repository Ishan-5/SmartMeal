"use client";

import { ArrowRight, CheckCircle2, LoaderCircle } from "lucide-react";
import { useState } from "react";

import { cn, isValidEmail } from "@/lib/utils";

export function WaitlistForm({ compact = false, source = "website" }: { compact?: boolean; source?: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "loading" || status === "success") return;
    setMessage("");
    if (!isValidEmail(email)) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }
    setStatus("loading");
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });
      const data = (await response.json()) as { error?: string; message?: string; alreadyJoined?: boolean };
      if (!response.ok) throw new Error(data.error ?? "Something went wrong.");
      setStatus("success");
      setMessage(data.alreadyJoined ? "You're already on the list — we'll be in touch." : "You're in! We'll email you when early access opens.");
      setEmail("");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
    }
  }

  return (
    <div className={cn("w-full", compact ? "max-w-xl" : "max-w-[480px]")}>
      <form onSubmit={submit} className={cn("flex gap-2", compact ? "flex-col sm:flex-row" : "flex-col sm:flex-row")}>
        <label className="sr-only" htmlFor={`waitlist-email-${source}`}>Email address</label>
        <input
          id={`waitlist-email-${source}`}
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className={cn(
            "input flex-1",
            status === "error" && "border-clay/60 focus:border-clay focus:ring-clay/10",
            compact ? "border-white/20 bg-white/10 text-paper placeholder:text-paper/50 focus:border-paper/50 focus:ring-white/10" : "",
          )}
          aria-invalid={status === "error"}
          aria-describedby={`waitlist-message-${source}`}
        />
        <button type="submit" className={cn(compact ? "btn-light shrink-0" : "btn-primary shrink-0")} disabled={status === "loading" || status === "success"}>
          {status === "loading" ? (
            <><LoaderCircle className="h-4 w-4 animate-spin" /> Joining…</>
          ) : status === "success" ? (
            <><CheckCircle2 className="h-4 w-4" /> You&apos;re in</>
          ) : (
            <>Get Early Access <ArrowRight className="h-4 w-4" /></>
          )}
        </button>
      </form>
      <p
        id={`waitlist-message-${source}`}
        className={cn(
          "mt-3 flex items-start gap-2 text-xs",
          status === "error" ? "text-clay" : compact ? "text-paper/60" : "text-muted",
        )}
        aria-live="polite"
        role={status === "error" ? "alert" : undefined}
      >
        {status === "success" && <CheckCircle2 className="mt-px h-4 w-4 shrink-0" />}
        {message || "No spam. Just launch news and early access."}
      </p>
    </div>
  );
}
