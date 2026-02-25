/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        sapphire: {
          deep: '#0F1F38',
          royal: '#1B3B6F',
          vibrant: '#24549C',
        },
        gold: {
          matte: '#C5A059',
          metallic: '#D4AF37',
          pale: '#E6D2A0',
        },
        neutral: {
          alabaster: '#F9F9F7',
          porcelain: '#FFFFFF',
          charcoal: '#1A1A1A',
          stone: '#8C8C8C',
        },
        admin: {
          bg: '#0B1121',
          card: '#151F32',
          text: '#F8FAFC',
          'text-secondary': '#94A3B8',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['Manrope', 'sans-serif'],
        accent: ['Cinzel', 'serif'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};