/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      xxs: "400px",
      sm: "480px",
      md: "768px",
      lg: "976px",
      xl: "1440px",
    },
    colors: {
      primary: "#173A72",
      secondary: "#EAD859",
      tertiary: "#E83C50",
      blue: "#002776",
      orange: "#EC4E20",
      green: "#009541",
      yellow: "#FEC409",
      black: "#1d1d1b",
      grayDark: "#3d3d3d",
      gray: "#c2c2c2",
      grayLight: "#f0f0f0",
      white: "#fafafa",
      hoverWhite: "rgba(255, 255, 255, 0.3)",
    },
    fontFamily: {
      primary: ["SomeTimeLater"],
      qatar: ["Qatar2022-Bold"],
    },
    extend: {},
  },
  plugins: [],
};
