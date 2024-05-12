/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'phone': {'min': '0px', 'max': '640px'},
      'tablet': {'min': '640px', 'max': '1000px'},
      'desktop': {'min': '1000px', 'max': '1440px'},
      'mobile': {'min': '0px', 'max': '1000px'},
      sm: "640px",
      md: "1000px",
      lg: "1450px",
      xl: "1440px",
    },
    colors: {
      primary: "#2E1B5B", 
      secondary: "#F5CE00",
      tertiary: "#642712",
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
      darkblue: "#2E1B5B",
      pink: "#FF3184"
    },
    fontFamily: {
      primary: ["UPHEAVAL"], //Staatliches
      secondary: ["VideoType"], //Poppins
      tertiary: ["VideoType"]
    },
    extend: {
      backgroundImage: {
        'sky': "url('/assets/27-imgs/login-bg.png')",
        'footer-texture': "url('/img/footer-texture.png')",
      }
    },
  },
  plugins: [],
};
