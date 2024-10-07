// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)", // Dynamic background color
        foreground: "var(--foreground)", // Dynamic foreground text color
        primary: "var(--primary)",       // Primary color from CSS variable
        secondary: "var(--secondary)",   // Secondary color from CSS variable
        textPrimary: "var(--text-primary)", // Primary text color
        textSecondary: "var(--text-secondary)", // Secondary text color
        sidebar: "var(--sidebar)",       // Sidebar background color
      },
    },
  },
  plugins: [],
};

export default config;
