import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        kisan: {
          50: "#f2f9f1",
          100: "#e1f3de",
          500: "#2e7d32",
          600: "#256628",
          700: "#1b4d1e",
          900: "#0c280e",
        },
      },
    },
  },
  plugins: [],
};

export default config;