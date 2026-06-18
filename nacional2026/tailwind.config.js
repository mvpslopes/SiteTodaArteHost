/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'DM Sans', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'Times New Roman', 'serif'],
      },
      colors: {
        nacional: {
          950: '#0F2419',
          900: '#163328',
          800: '#1B3D2F',
          700: '#234D3A',
          600: '#2D6149',
          500: '#3A7A5C',
          100: '#E8F0EA',
          50: '#F2F7F4',
          gold: '#E8D8B0',
          cream: '#D4C4A0',
        },
      },
      backgroundImage: {
        'nacional-radial': 'radial-gradient(ellipse at center, #2D6149 0%, #1B3D2F 50%, #0F2419 100%)',
        'nacional-linear': 'linear-gradient(180deg, #E8F0EA 0%, #D4E4D8 50%, #C5D9CB 100%)',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)',
        soft: '0 4px 24px -4px rgb(0 0 0 / 0.08)',
        nacional: '0 8px 32px -8px rgb(15 36 25 / 0.35)',
      },
      animation: {
        'splash-logo': 'splashLogo 1.2s ease-out forwards',
      },
      keyframes: {
        splashLogo: {
          '0%': { opacity: '0', transform: 'scale(0.92) translateY(12px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
