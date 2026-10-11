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
        ink: {
          DEFAULT: "var(--ink)",
          soft: "var(--ink-soft)",
        },
        muted: "var(--muted)",
        paper: "var(--paper)",
        panel: "var(--panel)",
        line: "var(--line)",
        teal: {
          DEFAULT: "var(--teal)",
          deep: "var(--teal-deep)",
        },
        amber: "var(--amber)",
        sky: "var(--sky)",
        rose: "var(--rose)",
      },
      fontFamily: {
        display: ["var(--font-syne)", "Noto Sans TC", "sans-serif"],
        body: ["var(--font-dm)", "Noto Sans TC", "sans-serif"],
      },
      boxShadow: {
        soft: "var(--shadow)",
      },
      borderRadius: {
        panel: "var(--radius)",
      },
    },
  },
  plugins: [],
} satisfies Config;
