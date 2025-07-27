/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './index.html'],
  theme: {
    colors: {
      primaryBlack: '#000000',
      primaryWhite: '#FFFFFF',
      primaryRed: '#FF0000',
      primaryGreen: '#00FF00',
      primaryBlue: '#0000FF',
      primaryYellow: '#FFFF00'
    }
  },
  plugins: [],
  future: {
    oklch: false,
    enableUniversalColorPalette: false,
    disableColorOpacityUtilitiesByDefault: true,
    respectDefaultRingColorOpacity: true
  },
  corePlugins: {
    // Ensure we're using standard RGB colors
    textOpacity: false,
    backgroundOpacity: false,
    borderOpacity: false,
    divideOpacity: false,
    placeholderOpacity: false,
    ringOpacity: false
  }
}
