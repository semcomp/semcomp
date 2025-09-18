/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'superdesktop': {'min': '1600px'},
      'desktop': {'min': '1000px', 'max': '1600px'},
      'tablet': {'min': '640px', 'max': '1000px'},
      'phone': {'min': '0px', 'max': '640px'},
      'below-xl': {'max': '1515px'}, // Media query para telas abaixo de 1515px
      
      'not-phone': {'min': '640px'},
      'medphone': {'min': '430px', 'max': '640px'},
      'mobile': {'min': '0px', 'max': '1050px'},
      ee: "400px",
      dd: "520px",
      sm: "640px",
      md: "1000px",
      xl: "1440px",
      lg: "1450px",
    },
    colors: {
      primary: "#242D5C", 
      secondary: "#00B4D8",
      tertiary: "#E8E8E8",
      accent: "#4A90E2",
      neutral: "#F8F9FA",
      text: "#2C3E50",
      blue: "#242D5C",
      black: "#1d1d1b",
      grayDark: "#3d3d3d",
      gray: "#c2c2c2",
      grayLight: "#f0f0f0",
      white: "#FCFBFF",
      hoverWhite: "rgba(255, 255, 255, 0.3)",
      hoverPrimary: "#051FAB",
      darkblue: "#242D5C",
      pink: "#FF3184",
      backgroundBlue: "#232234ff",
      Symbiosia: "#6fbe39ff",
      Stormrock: "#f26f18ff",
      Cybertechna: "#470787ff",
      Arcadium: "#0e56cbff",
      cardDarkBackground: "#222333",
      modalTitleColor: "#00B4D8",
    },
    fontFamily: {
      primary: ["Cinzel", "system-ui", "sans-serif"],
      secondary: ["Poppins"],
      tertiary: ["BebasNeue"]
    },
    fontSize: {
      'superlarge': '25px',
      'large': '20px',
      'medium': '15px',
      'small': '14px',
      'tiny': '13px',

      'title-superlarge': '50px',
      'title-large': '40px',
      'title-medium': '35px',
      'title-small': '30px',
      'title-tiny': '25px',
    },
    extend: {
      backgroundImage: {
        'sky': "url('/assets/27-imgs/login-bg.png')",
        'footer-texture': "url('/img/footer-texture.png')",
      }
    },
  },
  plugins: [],
  safelist: [{
    pattern: /(bg|text|border)-(blue|yellow|white|Symbiosia|backgroundBlue|Stormrock|Cybertechna|Arcadium)/
  }
]
};
