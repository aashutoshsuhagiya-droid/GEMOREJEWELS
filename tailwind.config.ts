import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cullen: {
          linen: "#FDFBF7",         // Cullen primary warm neutral background
          oatmeal: "#F7F5F0",       // Secondary section fill & card image background
          card: "#FFFFFF",
          charcoal: "#1C1917",      // Deep stone primary ink
          muted: "#6B7280",         // Secondary descriptive text
          forest: "#1B382B",        // Cullen signature deep emerald/forest CTA
          forestHover: "#13291F",
          gold: "#C5A880",          // Champagne gold for rating stars, badges & lines
          goldLight: "#F7F3EB",
          border: "#E7E3DA",       // Hairline editorial divider
          borderDark: "#D6D1C6",
          red: "#D9383A",           // Wishlist active heart
        },
        metal: {
          yellow: "#E6CA65",
          rose: "#E5A894",
          white: "#E2E2E2",
          platinum: "#CDD1D6",
        },
      },
      fontFamily: {
        serif: ["var(--font-cormorant)", "Cormorant Garamond", "Didot", "Georgia", "serif"],
        sans: ["var(--font-jost)", "Jost", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        'cullen-sm': '0 2px 8px rgba(28, 25, 23, 0.04)',
        'cullen-md': '0 6px 20px rgba(28, 25, 23, 0.07)',
        'cullen-lg': '0 16px 40px rgba(28, 25, 23, 0.09)',
        'cullen-button': '0 4px 14px rgba(27, 56, 43, 0.16)',
        'cullen-button-hover': '0 6px 20px rgba(27, 56, 43, 0.24)',
      },
      letterSpacing: {
        widest: '0.22em',
        luxury: '0.14em',
      }
    }
  },
  plugins: []
} satisfies Config;
