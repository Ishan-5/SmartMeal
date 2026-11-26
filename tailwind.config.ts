import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        cream: "#F7F4ED",
        paper: "#FFFDF8",
        ink: "#1F3029",
        muted: "#6B756D",
        moss: "#254A3A",
        sage: "#8CA898",
        mint: "#DCE8DD",
        sand: "#E8DFCF",
        clay: "#C97A54",
        gold: "#D8B26A",
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
        serif: ["Iowan Old Style", "Palatino Linotype", "Book Antiqua", "Palatino", "Georgia", "serif"],
      },
      boxShadow: {
        soft: "0 18px 50px -28px rgba(31, 48, 41, 0.35)",
        card: "0 8px 30px -18px rgba(31, 48, 41, 0.28)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out both",
        float: "float 5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
