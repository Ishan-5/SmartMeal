import type { Metadata } from "next";

interface PageMetaOptions {
  title: string;
  description: string;
  path: string;
  index?: boolean;
}

/** Per-page metadata with the correct canonical URL, overriding the root default. */
export function pageMeta({ title, description, path, index = true }: PageMetaOptions): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    robots: { index, follow: index },
    openGraph: { title: `${title} · SmartMeal`, description, url: path, type: "website" },
    twitter: { card: "summary_large_image", title: `${title} · SmartMeal`, description },
  };
}
