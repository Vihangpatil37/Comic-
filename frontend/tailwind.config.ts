import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      animation: {
        'modal-in': 'modal-in 150ms ease-out',
      },
      colors: {
        vellum: "var(--color-vellum)",
        paper: "var(--color-paper)",
        ink: "var(--color-ink)",
        slate: "var(--color-slate)",
        hairline: "var(--color-hairline)",
        oxide: "var(--color-oxide)",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        data: ["var(--font-data)"],
      },
      spacing: {
        '24': '24px',
        '32': '32px',
        '48': '48px',
        '64': '64px',
      },
      borderRadius: {
        DEFAULT: '2px',
        none: '0',
        sm: '2px',
        md: '2px',
        lg: '2px',
        full: '9999px',
      },
      boxShadow: {
        'modal': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
};
export default config;
