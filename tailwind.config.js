/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        property: {
          brown: '#8B4513',
          darkblue: '#0038A8',
          green: '#1E7921',
          yellow: '#FFD700',
          red: '#D91E1E',
          orange: '#FF8C00',
          pink: '#E91E63',
          lightblue: '#4FC3F7',
          railroad: '#2B2B2B',
          utility: '#C0D6DF'
        }
      },
      fontFamily: {
        game: ['"Outfit"', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -2px rgba(0, 0, 0, 0.2)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.2)',
        'card-glow': '0 0 15px rgba(255, 215, 0, 0.6)'
      }
    },
  },
  plugins: [],
}

