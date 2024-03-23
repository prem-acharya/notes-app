/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        'custom': '10px 5px 90px 15px rgba(0, 0, 0, 0.3)',
      },
      zIndex: {
        '100': '100',
      }
    },
  },
  plugins: [],
}