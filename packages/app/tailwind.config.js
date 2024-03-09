/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      xxs: "400px",
      sm: "640px",
      md: "768px",
      lg: "976px",
      xl: "1440px",
    },
    colors: {
      primary: "#173A72", 
      secondary: "#FFFFF",
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

      blue1_26: "#489FB7",
      blue2_26: "#4AD2F8",
      blue3_26: "#3DD2FC",
      blue4_26: "A2DDE1",
      green1_26: "#F2FFDD",
      green2_26: "#B6EA5D",
      green3_26: "#CCE89D",
      purple_26: "#C791F1",
      pink1_26: "#ED8EF6",
      pink2_26: "#EF99CD",
    },
    fontFamily: {
      primary: ["Staatliches"],
      secondary: ["Poppins"],
      tertiary: ["Poppins"]
    },
    extend: {},
  },
  plugins: [],
};
