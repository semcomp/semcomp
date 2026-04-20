/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        semcompDarkBlue: "#0B2639",
        semcompAlmostDarkBlue: "#003050",
        semcompMidDarkBlue: "#105079",
        semcompMidLightBlue: "#357BA3",
        semcompLightBlue: "#D2EDFF",
        semcompOffWhite: "#FAFDFF",
        semcompOffBlack: "#000407",
      },
      fontFamily: {
        sans: ["Geist Variable", "system-ui", "sans-serif"],
        poppins: ["Poppins", "ui-sans-serif", "system-ui", "sans-serif"],
        comfortaa: ["Comfortaa", "system-ui", "sans-serif"],
      },
      keyframes: {
        slide: {
          from: { opacity: "0", transform: "translateX(60px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        shimmer: {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(100%)" },
        },
      },
      animation: {
        slide: "slide 1s ease",
        shimmer: "shimmer 2s linear infinite",
       },
     boxShadow: {
      input: 'var(--shadow-input)',
      },
    },
  },
  plugins: [],
};
