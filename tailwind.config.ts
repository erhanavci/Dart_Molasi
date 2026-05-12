import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        neon: "0 0 24px rgba(52, 211, 153, 0.35)",
        amber: "0 0 24px rgba(251, 191, 36, 0.35)",
        rose: "0 0 24px rgba(244, 114, 182, 0.35)"
      },
      animation: {
        "soft-pulse": "softPulse 1.4s ease-in-out infinite",
        "score-pop": "scorePop 620ms cubic-bezier(.2,.9,.2,1)",
        float: "float 7s ease-in-out infinite",
        shake: "shake 220ms linear"
      },
      keyframes: {
        softPulse: {
          "0%,100%": { transform: "scale(1)", opacity: "0.85" },
          "50%": { transform: "scale(1.05)", opacity: "1" }
        },
        scorePop: {
          "0%": { transform: "translateY(8px) scale(.9)", opacity: "0" },
          "45%": { transform: "translateY(-8px) scale(1.15)", opacity: "1" },
          "100%": { transform: "translateY(-22px) scale(1)", opacity: "0" }
        },
        float: {
          "0%,100%": { transform: "translate3d(0,0,0) rotate(-1deg)" },
          "50%": { transform: "translate3d(0,-14px,0) rotate(1deg)" }
        },
        shake: {
          "0%,100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-5px)" },
          "50%": { transform: "translateX(4px)" },
          "75%": { transform: "translateX(-2px)" }
        }
      }
    }
  },
  plugins: []
} satisfies Config;
