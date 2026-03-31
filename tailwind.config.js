/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: "#f3efe8",
        accent: "#bba591",
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      keyframes: {
        "horse-gallop": {
          "0%, 100%": { transform: "translateX(0) translateY(0) rotate(-3deg)" },
          "20%": { transform: "translateX(3px) translateY(-7px) rotate(2deg)" },
          "40%": { transform: "translateX(6px) translateY(-2px) rotate(-2deg)" },
          "60%": { transform: "translateX(3px) translateY(-8px) rotate(3deg)" },
          "80%": { transform: "translateX(-2px) translateY(-1px) rotate(-1deg)" },
        },
      },
      animation: {
        "horse-gallop": "horse-gallop 0.55s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
