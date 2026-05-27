import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "brand-navy":   "#0A1628",
        "brand-navy-2": "#0D1E35",
        "brand-navy-3": "#102040",
        "brand-gold":   "#C9952A",
        "brand-gold-2": "#E0AA3E",
        "brand-gold-3": "#F0C060",
        "surface-1":    "#111D30",
        "surface-2":    "#162038",
        "surface-3":    "#1C2A45",
        "surface-4":    "#243050",
        "status-resolved":  "#22C55E",
        "status-pending":   "#F59E0B",
        "status-dispute":   "#3B82F6",
        "status-cancelled": "#EF4444",
        "status-mailed":    "#8B5CF6",
        "bureau-experian":   "#0066CC",
        "bureau-transunion": "#00A0D2",
        "bureau-equifax":    "#CC0000",
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #C9952A 0%, #E8B84B 100%)",
        "navy-gradient": "linear-gradient(180deg, #0A1628 0%, #0D1E35 100%)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
      },
      keyframes: {
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
