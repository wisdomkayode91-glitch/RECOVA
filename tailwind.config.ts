import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f9f6",
          500: "#0f9d78",
          600: "#0c7f61",
          700: "#0a6650",
        },
      },
    },
  },
  plugins: [],
};

export default config;
