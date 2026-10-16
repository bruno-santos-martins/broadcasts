/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        unni: {
          sidebar: '#0C1019',
          main: '#12192A',
          card: '#1B2946',
          cardHover: '#203154',
          input: '#0E1524',
          border: '#2A3E66',
          divider: '#223354',
          accent: '#54D1D6',
          accentHover: '#45C4C9',
          accentText: '#0C181F',
          muted: '#8E9EB5',
        },
      },
    },
  },
  plugins: [],
}
