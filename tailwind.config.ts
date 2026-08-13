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
          50: "#f7f7f8",
          100: "#ececef",
          200: "#d8d8dd",
          300: "#b7b7bf",
          400: "#8b8b92",
          500: "#6b6b72",
          600: "#55565c",
          700: "#3d3e42",
          800: "#26262b",
          900: "#1b1b1f",
        },
        brand: {
          50: "#fdf4f4",
          100: "#f8e3e3",
          200: "#eec2c3",
          300: "#dd9a9c",
          400: "#c46367",
          500: "#a53a40",
          600: "#7f2530",
          700: "#661f28",
          800: "#4f171f",
          900: "#3a1116",
        },
      },
      fontFamily: {
        sans: ['"Inter"', "Segoe UI", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
