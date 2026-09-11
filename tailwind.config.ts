import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0a0d12",
        panel: "#11161e",
        line: "#202935",
        muted: "#8490a1",
        accent: "#c9a86a",
        success: "#54c59a",
        danger: "#f07878",
      },
      boxShadow: { panel: "0 18px 45px rgba(0,0,0,.18)" },
    },
  },
  plugins: [],
};

export default config;
