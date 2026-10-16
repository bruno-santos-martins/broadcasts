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
          card: '#172134',
          input: '#0F1624',
          border: '#222E46',
          divider: '#1C263B',
          accent: '#54D1D6',
          accentHover: '#45C4C9',
          accentText: '#0C181F',
          muted: '#8291A5',
        },
      },
    },
  },
  plugins: [],
}
