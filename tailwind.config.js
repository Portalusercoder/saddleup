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
        base: "#FFFBF0",
        accent: "#53161D",
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      transitionTimingFunction: {
        "out-expo": "var(--ease-out-expo)",
        "out-quart": "var(--ease-out-quart)",
        spring: "var(--ease-spring)",
        "in-expo": "var(--ease-in-expo)",
      },
      transitionDuration: {
        instant: "var(--dur-instant)",
        fast: "var(--dur-fast)",
        normal: "var(--dur-normal)",
        slow: "var(--dur-slow)",
        xslow: "var(--dur-xslow)",
      },
    },
  },
  plugins: [],
};
