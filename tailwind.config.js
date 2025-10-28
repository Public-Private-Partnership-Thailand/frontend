module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        'chula-pink': {
          lighter: '#f8e1ea',
          light: '#ff86b4',
          DEFAULT: '#de5c8e',
          dark: '#dd5b8e',
          darker: '#db2777',
        },
        'chula-gray': {
          dark: '#333',
          DEFAULT: '#58595b',
          light: '#777',
          border: '#e5e5e5',
          input: '#ccc',
        },
      },
    },
  },
  plugins: [],
}
