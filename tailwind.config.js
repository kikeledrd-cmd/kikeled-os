/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#06070a',
        graphite: '#111318',
        slate: '#171a21',
        line: '#232734',
        soft: '#96a0b8',
        panel: '#0d1016',
        glow: '#37d2ff',
        lime: '#8bffb0',
        rose: '#ff4d6d',
        amber: '#ffb627',
      },
      boxShadow: {
        soft: '0 20px 60px rgba(0,0,0,0.35)',
      },
      backgroundImage: {
        noise:
          'radial-gradient(circle at top left, rgba(55,210,255,0.18), transparent 26%), radial-gradient(circle at top right, rgba(139,255,176,0.12), transparent 18%), linear-gradient(180deg, #06070a 0%, #0d1016 48%, #111318 100%)',
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
