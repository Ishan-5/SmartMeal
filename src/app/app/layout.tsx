import type { Metadata, ReactNode } from "next";

import { pageMeta } from "@/lib/page-meta";

export const metadata: Metadata = pageMeta({
  title: "Meal planner workspace",
  description: "Scan your ingredients, set your household and build a protein-forward weekly plan.",
  path: "/app",
});

export default function AppLayout({ children }: { children: ReactNode }) {
  return children;
}
