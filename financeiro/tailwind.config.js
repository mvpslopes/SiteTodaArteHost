/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Montserrat', 'system-ui', 'sans-serif'],
        display: ['Montserrat', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        /* Cinza quente — as telas antigas (gray-*) passam a parecer creme/marrom */
        gray: {
          50: '#F8F7F4',
          100: '#F3EEE6',
          200: '#E6D8C3',
          300: '#D4C4B0',
          400: '#C4B09A',
          500: '#A0896A',
          600: '#81705F',
          700: '#6B5A4A',
          800: '#4F3E32',
          900: '#3d2f26',
          950: '#2a211c',
        },
        primary: {
          50: '#faf8f6',
          100: '#f5f0eb',
          200: '#e8ddd4',
          300: '#d4c4b0',
          400: '#D4B896',
          500: '#AC8869',
          600: '#81705F',
          700: '#6B5A4A',
          800: '#4F3E32',
          900: '#3d2f26',
        },
        brand: {
          brown: '#81705F',
          beige: '#E6D8C3',
          'off-white': '#F8F7F4',
          olive: '#A0896A',
          'dark-brown': '#4F3E32',
          gold: '#AC8869',
          'gold-light': '#D4B896',
        },
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
      },
    },
  },
  plugins: [],
};
