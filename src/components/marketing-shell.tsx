import type { ReactNode } from "react";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

/** Shared frame for public content pages: sticky nav, main landmark and footer. */
export function MarketingShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-cream">
      <SiteHeader />
      {children}
      <SiteFooter />
    </div>
  );
}
