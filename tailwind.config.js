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
        base: "#0C100E",
        accent: "#1F4D3A",
        paddock: "#8FAE98",
        mist: "#E8ECE7",
        brass: "#B8A07A",
        forest: "#0E1512",
        card: "#151A17",
        elevated: "#1C221E",
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
