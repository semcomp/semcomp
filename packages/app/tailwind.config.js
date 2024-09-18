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
      primary: "#2E1B5B", 
      secondary: "#F5CE00",
      tertiary: "#642712",
      blue: "#242d5c",
      orange: "#EC4E20",
      green: "#009541",
      yellow: "#f9f004",
      black: "#1d1d1b",
      grayDark: "#3d3d3d",
      gray: "#c2c2c2",
      grayLight: "#f0f0f0",
      white: "#FCFBFF",
      hoverWhite: "rgba(255, 255, 255, 0.3)",
      darkblue: "#2E1B5B",
      pink: "#FF3184"
    },
    fontFamily: {
      primary: ["UPHEAVAL"], //Staatliches
      secondary: ["VideoType"], //Poppins
      tertiary: ["VideoType"]
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
    pattern: /(bg|text|border)-(blue|yellow|white)/
  }
]
};
