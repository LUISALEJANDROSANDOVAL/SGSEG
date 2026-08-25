/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        utepsa: {
          blue: '#00205B',
          red: '#C8102E',
          white: '#FFFFFF',
        }
      }
    },
  },
  plugins: [],
}
