/** @type {import('tailwindcss').Config} */

/**
 * Two kinds of colour, kept deliberately apart.
 *
 * Brand colours (navy, gold) are fixed. They are the identity, they read on
 * both grounds, and the deep navy sections — hero, footer, call-to-action
 * bands — are meant to stay dark whatever the theme.
 *
 * Theme tokens (surface, ink, line) resolve through CSS variables and flip
 * under `.dark`. Anything that is "the page" rather than "the brand" uses
 * these, so light and dark are a property of the palette instead of something
 * every component has to remember with a `dark:` variant.
 */
const themed = (variable) => `rgb(var(${variable}) / <alpha-value>)`

export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: themed('--surface'),
        'surface-sunk': themed('--surface-sunk'),
        'surface-muted': themed('--surface-muted'),
        line: themed('--line'),
        'line-strong': themed('--line-strong'),
        ink: themed('--ink'),
        'ink-muted': themed('--ink-muted'),
        'ink-faint': themed('--ink-faint'),

        /* Accent and status tints, so a coloured panel keeps its hue in both
           themes instead of staying a pale wash on a dark page. */
        tint: {
          blue: themed('--tint-blue'),
          emerald: themed('--tint-emerald'),
          teal: themed('--tint-teal'),
          purple: themed('--tint-purple'),
          rose: themed('--tint-rose'),
          amber: themed('--tint-amber'),
          orange: themed('--tint-orange'),
          indigo: themed('--tint-indigo'),
          yellow: themed('--tint-yellow'),
          sky: themed('--tint-sky'),
          violet: themed('--tint-violet'),
          critical: themed('--tint-critical'),
          positive: themed('--tint-positive'),
        },
        critical: themed('--on-critical'),
        positive: themed('--on-positive'),
        warning: themed('--on-warning'),
        info: themed('--on-info'),
        'line-critical': themed('--line-critical'),
        'line-positive': themed('--line-positive'),
        'line-warning': themed('--line-warning'),

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
          /** The dark brand surface, fixed in both themes. */
          surface: '#0a1628',
          light: '#111d32',
          dark: '#070e1a',
        },
        gold: {
          50: themed('--gold-50'),
          100: '#f6efd8',
          200: '#ecdcaa',
          300: '#e0c67c',
          400: '#d5b563',
          500: '#c9a84c',
          600: themed('--gold-600'),
          700: themed('--gold-700'),
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
