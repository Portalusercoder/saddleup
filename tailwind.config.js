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
        /* Two-color system: ink + mist (aliases kept for existing class names) */
        base: "#0E1512",
        ink: "#0E1512",
        forest: "#0E1512",
        mist: "#E8ECE7",
        accent: "#0E1512",
        paddock: "#0E1512",
        brass: "#0E1512",
        card: "#161B18",
        elevated: "#1A201C",
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
