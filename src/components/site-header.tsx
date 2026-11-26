"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Leaf, LogOut, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { cn, initialiseName } from "@/lib/utils";

interface SessionUser {
  name: string;
  email: string;
}

const links = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#features", label: "Features" },
  { href: "/#our-story", label: "Our story" },
  { href: "/#faq", label: "FAQ" },
];

export function SiteHeader() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    if (!open) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  useEffect(() => {
    if (!accountOpen) return;
    function closeOnOutside(event: PointerEvent) {
      if (!accountRef.current?.contains(event.target as Node)) setAccountOpen(false);
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setAccountOpen(false);
    }
    window.addEventListener("pointerdown", closeOnOutside);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("pointerdown", closeOnOutside);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [accountOpen]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data: { user?: SessionUser | null }) => setUser(data.user ?? null))
      .catch(() => undefined)
      .finally(() => setCheckingSession(false));
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setOpen(false);
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-moss/10 bg-cream/85 backdrop-blur-xl">
      <div className="shell flex h-[72px] items-center justify-between gap-6">
        <Link href="/" className="group flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-moss text-paper shadow-card transition-transform group-hover:-rotate-6">
            <Leaf className="h-[18px] w-[18px]" strokeWidth={2.2} />
          </span>
          <span className="font-serif text-[22px] font-semibold tracking-tight">SmartMeal</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted transition-colors hover:text-moss"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {checkingSession ? (
            <div className="h-10 w-10 animate-pulse rounded-full bg-mint/50" aria-hidden="true" />
          ) : user ? (
            <>
              <Link href="/app" className="btn-outline !px-5 !py-2.5">
                Open app <ArrowRight className="h-4 w-4" />
              </Link>
              <div className="relative" ref={accountRef}>
                <button
                  type="button"
                  onClick={() => setAccountOpen((value) => !value)}
                  className="grid h-10 w-10 place-items-center rounded-full bg-mint text-xs font-bold text-moss ring-1 ring-moss/15 transition-transform hover:scale-105"
                  aria-label={`Account menu for ${user.name}`}
                  aria-expanded={accountOpen}
                  aria-haspopup="menu"
                >
                  {initialiseName(user.name)}
                </button>
                {accountOpen && (
                  <div role="menu" className="absolute right-0 top-12 z-50 w-56 rounded-2xl border border-moss/10 bg-paper p-2 shadow-soft">
                    <p className="truncate px-3 py-2 text-xs text-muted">{user.email}</p>
                    <Link
                      href="/app"
                      onClick={() => setAccountOpen(false)}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-ink hover:bg-mint/60"
                    >
                      <ArrowRight className="h-4 w-4" /> Open workspace
                    </Link>
                    <button
                      type="button"
                      onClick={() => void logout().then(() => setAccountOpen(false))}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-ink hover:bg-mint/60"
                    >
                      <LogOut className="h-4 w-4" /> Log out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="px-2 text-sm font-semibold text-moss hover:underline">
                Log in
              </Link>
              <Link href="/#waitlist" className="btn-primary !px-5 !py-2.5">
                Join the waitlist <ArrowRight className="h-4 w-4" />
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-xl border border-moss/15 text-moss md:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-navigation"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div
        id="mobile-navigation"
        className={cn(
          "overflow-hidden border-t border-moss/10 bg-paper transition-[max-height] md:hidden",
          open ? "max-h-[32rem]" : "max-h-0 border-t-0",
        )}
      >
        <div className="shell flex flex-col gap-1 py-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-2.5 text-sm font-medium text-ink hover:bg-mint/50"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-2 flex flex-col gap-2">
            <Link href="/app" onClick={() => setOpen(false)} className="btn-outline w-full">
              Try the demo
            </Link>
            {checkingSession ? (
              <div className="h-11 w-full animate-pulse rounded-full bg-mint/50" aria-hidden="true" />
            ) : user ? (
              <button type="button" onClick={() => void logout()} className="btn-primary w-full">
                Log out
              </button>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)} className="btn-outline w-full">
                  Log in
                </Link>
                <Link href="/#waitlist" onClick={() => setOpen(false)} className="btn-primary w-full">
                  Join the waitlist <ArrowRight className="h-4 w-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
