import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SmartMeal · Your AI kitchen assistant",
    short_name: "SmartMeal",
    description: "Turn a fridge photo into a protein-forward weekly meal plan and grocery list.",
    start_url: "/app",
    display: "standalone",
    background_color: "#F7F4ED",
    theme_color: "#F7F4ED",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
