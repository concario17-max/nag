/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        sand: {
          primary: '#f6efe3',
          secondary: '#efe5d2',
          tertiary: '#e2d3b8',
        },
        gold: {
          primary: '#a68b5c',
          deep: '#6c5432',
          light: '#d6c7a2',
          muted: '#8c6d45',
          surface: '#f3ead7',
          border: '#d8c9ab',
        },
        charcoal: {
          main: '#1c2b36',
        },
        dark: {
          bg: '#12110f',
          surface: '#1b1814',
          border: '#313131',
          text: {
            primary: '#f3eee5',
            secondary: '#bdb7ac',
          },
        },
        text: {
          primary: '#1a1a1a',
          secondary: '#4b4b4b',
        },
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        crimson: ['"Crimson Pro"', 'serif'],
        noto: ['"Noto Serif KR"', 'serif'],
        korean: ['Pretendard Variable', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
