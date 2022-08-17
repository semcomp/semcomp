/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      sm: '480px',
      md: '768px',
      lg: '976px',
      xl: '1440px',
    },
    colors: {
      'blue': '#227aa8',
      'purple': '#7e5bef',
      'pink': '#d49aa7',
      'orange': '#ed9f3a',
      'green': '#70ba4c',
      'yellow': '#ffc82c',
      'black': '#1d1d1b',
      'gray-dark': '#3d3d3d',
      'gray': '#c2c2c2',
      'gray-light': '#f0f0f0',
      'white': '#fafafa',
    },
    extend: {}
  },
  plugins: [],
}
