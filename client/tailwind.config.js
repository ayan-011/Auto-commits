/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        github: {
          dark: '#0d1117',
          gray: '#21262d',
          light: '#f6f8fa',
          border: '#30363d',
          text: '#c9d1d9',
          muted: '#8b949e'
        }
      }
    },
  },
  plugins: [],
} 