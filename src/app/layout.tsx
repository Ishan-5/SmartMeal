import type { Metadata, Viewport } from "next";

import "./globals.css";

const siteUrl = (
  process.env.APP_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
).replace(/\/$/, "");

const siteName = "SmartMeal";
const description =
  "Photograph your fridge, set your household, and get a protein-forward weekly meal plan with an exact grocery list. Free to try, no sign-up needed.";
const socialImage = "/images/hero-kitchen.svg";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: siteName,
  applicationCategory: "LifestyleApplication",
  operatingSystem: "Web",
  description,
  url: siteUrl,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} · Your AI kitchen assistant`,
    template: `%s · ${siteName}`,
  },
  description,
  keywords: [
    "meal planning",
    "AI kitchen assistant",
    "protein meals",
    "grocery list",
    "recipe planner",
    "fridge photo recognition",
  ],
  applicationName: siteName,
  authors: [{ name: siteName }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName,
    locale: "en_US",
    url: siteUrl,
    title: `${siteName} · Your AI kitchen assistant`,
    description: "Snap your ingredients. Get a week of meals built around your household and your fridge.",
    images: [{ url: socialImage, width: 640, height: 560, alt: "SmartMeal kitchen" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} · Your AI kitchen assistant`,
    description: "Snap your ingredients. Get a week of meals built around your household and your fridge.",
    images: [socialImage],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#F7F4ED",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-moss focus:px-5 focus:py-2 focus:text-sm focus:font-semibold focus:text-paper"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
