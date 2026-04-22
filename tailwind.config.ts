import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#272727",
        charcoal: "#2c2c2c",
        cream: "#F7F5F1",
        stone: "#E8E2D9",
        taupe: "#B8A99A",
        moss: "#607946",
        sage: "#607946",
        bloom: "#F3A2A2",
        coral: "#E89580",
        blush: "#FBE5E2",
        magenta: "#A7266D",
      },
      fontFamily: {
        display: ["var(--font-display)", "Oleo Script", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Poppins", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        widest: "0.25em",
      },
      maxWidth: {
        "8xl": "88rem",
      },
    },
  },
  plugins: [],
};

export default config;
