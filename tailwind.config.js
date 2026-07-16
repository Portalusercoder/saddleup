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
        /* Two-color system: black + white (aliases kept for existing class names) */
        base: "#000000",
        ink: "#000000",
        forest: "#000000",
        mist: "#FFFFFF",
        accent: "#000000",
        paddock: "#000000",
        brass: "#000000",
        card: "#0A0A0A",
        elevated: "#111111",
      },
      fontFamily: {
        serif: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-outfit)", "system-ui", "sans-serif"],
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
      borderRadius: {
        control: "8px",
      },
    },
  },
  plugins: [],
};
