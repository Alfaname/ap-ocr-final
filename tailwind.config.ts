import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: { extend: { fontFamily: { sans: ["Lexend", "ui-sans-serif", "system-ui"] },
    colors: { brand: { DEFAULT: "#2f6f4e", light: "#D9EAD3" } } } },
  plugins: [],
} satisfies Config;
