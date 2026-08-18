/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Anchors: navy-900 is the deep brand navy, gold-500 the brand accent.
        // The mid navy shades (500-700) carry body copy, so they are tuned for
        // contrast on white rather than being simple tints of the anchor.
        navy: {
          50: '#f4f6fa',
          100: '#e5e9f2',
          200: '#c6cfe0',
          300: '#9caacb',
          400: '#6b7ea6',
          500: '#465b83',
          600: '#33456a',
          700: '#24334f',
          800: '#16223a',
          900: '#0a1628',
          DEFAULT: '#0a1628',
          light: '#111d32',
          dark: '#070e1a',
        },
        gold: {
          50: '#fbf8ef',
          100: '#f6efd8',
          200: '#ecdcaa',
          300: '#e0c67c',
          400: '#d5b563',
          500: '#c9a84c',
          600: '#ab8b3a',
          700: '#8a6e2c',
          800: '#6b5422',
          900: '#4d3c19',
          DEFAULT: '#c9a84c',
          light: '#d4b96a',
          dark: '#a88b3d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
