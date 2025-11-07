import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'loopy-sans': ['Meldina', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        thin: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Dark charcoal theme with subtle accents
        bla: {
          lime: "#c4f000",      // Bright lime accent
          dark: "#0a0a0a",      // Deep black
          charcoal: "#1a1a1a",  // Dark charcoal background
          "charcoal-light": "#2a2a2a", // Lighter charcoal
          "charcoal-border": "#333333", // Border color
          gray: "#f9fafb",      // Light gray backgrounds
          "gray-light": "#f3f4f6",
          border: "#e5e7eb",    // Light borders
          "text-light": "#e5e5e5", // Light text on dark
          "text-muted": "#999999", // Muted text
        },
      },
      fontWeight: {
        thin: '100',
        extralight: '200',
        light: '300',
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in",
        "slide-up": "slideUp 0.4s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        "slide-left": "slideLeft 0.4s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        slideLeft: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;

