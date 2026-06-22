/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        seat: {
          available: '#f0fdf4',
          reserved: '#fef2f2',
          pending: '#fefce8',
          mine: '#eff6ff',
          selected: '#dbeafe',
        },
      },
    },
  },
  plugins: [],
}
