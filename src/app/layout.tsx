import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "SmartMeal · Your AI kitchen assistant",
  description:
    "Snap your ingredients and get a week of protein-rich meal plans built around your household, portions and real-life schedule.",
  keywords: ["meal planning", "AI kitchen assistant", "protein meals", "grocery list", "recipe planner"],
  openGraph: {
    title: "SmartMeal · your AI kitchen assistant",
    description: "Snap your ingredients. Get a week of diet plan.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
