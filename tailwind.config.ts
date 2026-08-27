import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1d4ed8",
        secondary: "#3b82f6",
        accent: "#38bdf8",
        light: "#ffffff",
        lighter: "#f1f5f9",
        dark: "#ffffff",
        darker: "#f1f5f9",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-space-grotesk)", "sans-serif"],
      },
      animation: {
        "gradient": "gradient 8s linear infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        gradient: {
          "0%, 100%": {
            "background-size": "200% 200%",
            "background-position": "left center",
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "right center",
          },
        },
        glow: {
          "0%": {
            "box-shadow": "0 0 5px #3b82f6, 0 0 10px #3b82f6",
          },
          "100%": {
            "box-shadow": "0 0 10px #3b82f6, 0 0 20px #3b82f6",
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;

