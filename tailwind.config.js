/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: '420px',
      },
      fontFamily: {
        'instrument': ['"Instrument Serif"', 'serif'],
        'inter': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        'heading': ['"Instrument Serif"', 'serif'],
        'body': ['"Barlow"', 'sans-serif'],
      },
      keyframes: {
        'fade-rise': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-rise':          'fade-rise 0.8s ease-out both',
        'fade-rise-delay':    'fade-rise 0.8s ease-out 0.2s both',
        'fade-rise-delay-2':  'fade-rise 0.8s ease-out 0.4s both',
      },
    },
  },
  plugins: [],
}
