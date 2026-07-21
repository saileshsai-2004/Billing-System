import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: "#F97316", // Primary Orange
          "orange-dark": "#EA580C", // Dark Orange (hover/active)
          "orange-light": "#FFF7ED", // Light Orange background
          "orange-superlight": "#FFFBF5", // Very Light Orange accent
          text: "#1F2937", // Main text
          muted: "#6B7280", // Secondary text
          border: "#E5E7EB", // Neutral border
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
