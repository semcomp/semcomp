const themeColors = require("./styles/themeColors");

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
    colors: themeColors,
    fontFamily: {
      primary: ["Jost", "system-ui", "sans-serif"],
      secondary: ["Jost"],
      tertiary: ["Jost"]
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
