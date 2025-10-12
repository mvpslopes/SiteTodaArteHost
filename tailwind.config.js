/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        logo: '#AC8869',
        'logo-light': '#D4B896',
        'logo-dark': '#7A5C3A',
      },
    },
  },
  plugins: [],
};
