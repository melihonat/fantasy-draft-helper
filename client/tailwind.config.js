/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        'nfl-blue': '#013369',
        'nfl-red': '#D50A0A',
        'nfl-white': '#FFFFFF',
        'nfl-gray': '#A5ACAF',
      },
    },
  },
  plugins: [],
}