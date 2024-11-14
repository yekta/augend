import plugin from "tailwindcss/plugin";
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "hsl(var(--background))",
          secondary: "hsl(var(--background-secondary))",
        },
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        shadow: "hsl(var(--shadow))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        banano: "hsl(var(--banano))",
        nano: "hsl(var(--nano))",
        index: {
          fear: "hsl(var(--index-fear))",
          neutral: "hsl(var(--index-neutral))",
          greed: "hsl(var(--index-greed))",
        },
      },
      opacity: {
        2: "0.02",
        3: "0.03",
        8: "0.08",
        12: "0.12",
        36: "0.36",
        85: "0.85",
      },
      fontSize: {
        xxs: ["0.625rem", "1rem"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      spacing: {
        0.25: "0.0625rem",
        0.75: "0.1875rem",
        1.25: "0.3125rem",
        1.75: "0.4375rem",
        2.25: "0.5625rem",
        3.25: "0.8125rem",
        3.75: "0.9375rem",
        4.25: "1.0625rem",
        4.5: "1.125rem",
        5.25: "1.3125rem",
        5.5: "1.375rem",
        6.5: "1.625rem",
        10.5: "2.625rem",
        13: "3.25rem",
        15: "3.75rem",
        18: "4.5rem",
        22: "5.5rem",
        30: "7.5rem",
        31: "7.75rem",
        34: "8.5rem",
        37: "9.25rem",
        38: "9.5rem",
        112: "28rem",
        120: "30rem",
        128: "32rem",
        132: "33rem",
        134: "33.5rem",
        136: "34rem",
        150: "37.5rem",
        156: "39rem",
        160: "40rem",
        164: "41rem",
        166: "41.5rem",
        167: "41.75rem",
        168: "42rem",
      },
      ringWidth: {
        3: "3px",
      },
      boxShadow: {
        navbar:
          "0rem 0rem 0.5rem 0rem, 0rem 0rem 0.75rem 0rem, 0rem 0rem 1.5rem 0rem",
      },
    },
    animation: {
      skeleton: "skeleton 1.25s ease-in-out infinite",
      "pulse-scale": "pulse-scale 1s ease-in-out infinite",
    },
    keyframes: {
      skeleton: {
        "0%": {
          opacity: "20%",
        },
        "50%": {
          opacity: "40%",
        },
        "100%": {
          opacity: "20%",
        },
      },
      "pulse-scale": {
        "0%": {
          transform: "scale(0.7)",
        },
        "50%": {
          transform: "scale(1.4)",
        },
        "100%": {
          transform: "scale(0.7)",
        },
      },
    },
  },
  plugins: [
    plugin(function ({ addVariant }) {
      addVariant("not-touch", ".not-touch &"); // here
    }),
    require("tailwindcss-animate"),
  ],
};
export default config;
