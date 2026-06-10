module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Google Cloud color palette (matches cloud.google.com exactly)
        'gc-blue': {
          50:  '#e8f0fe',
          100: '#d2e3fc',
          200: '#aecbfa',
          300: '#7baaf7',
          400: '#4285f4',
          500: '#1a73e8',  // Primary Google Blue
          600: '#1557b0',
          700: '#0d47a1',
          800: '#0a3680',
          900: '#071e5e',
        },
        'gc-green': {
          50:  '#e6f4ea',
          100: '#ceead6',
          200: '#a8d5b5',
          300: '#81c995',
          400: '#34a853',  // Google Green
          500: '#1e8e3e',
          600: '#188038',
          700: '#137333',
          800: '#0d652d',
          900: '#0a5027',
        },
        'gc-gray': {
          50:  '#f8f9fa',
          100: '#f1f3f4',
          200: '#e8eaed',
          300: '#dadce0',
          400: '#bdc1c6',
          500: '#9aa0a6',
          600: '#80868b',
          700: '#5f6368',  // Google Gray (body text)
          800: '#3c4043',
          900: '#202124',  // Google Dark (headings)
        },
        // Eco-specific accent
        'eco': {
          light: '#e6f4ea',
          mid:   '#34a853',
          dark:  '#137333',
        },
      },
      fontFamily: {
        // Google Cloud uses "Google Sans" as primary, Roboto as fallback
        sans: ['"Google Sans"', '"Google Sans Text"', 'Roboto', '-apple-system', 'BlinkMacSystemFont', 'Arial', 'sans-serif'],
        display: ['"Google Sans"', 'Roboto', 'Arial', 'sans-serif'],
        body: ['"Google Sans Text"', 'Roboto', 'Arial', 'sans-serif'],
      },
      fontSize: {
        // Google Cloud type scale
        'display-lg': ['3.5rem',   { lineHeight: '4rem',    letterSpacing: '-0.02em', fontWeight: '400' }],
        'display-md': ['2.8rem',   { lineHeight: '3.25rem', letterSpacing: '-0.01em', fontWeight: '400' }],
        'headline':   ['1.5rem',   { lineHeight: '2rem',    letterSpacing: '0',       fontWeight: '400' }],
        'title-lg':   ['1.25rem',  { lineHeight: '1.75rem', letterSpacing: '0',       fontWeight: '500' }],
        'title-md':   ['1rem',     { lineHeight: '1.5rem',  letterSpacing: '0.015em', fontWeight: '500' }],
        'body-lg':    ['1rem',     { lineHeight: '1.5rem',  letterSpacing: '0.03em',  fontWeight: '400' }],
        'body-md':    ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.02em',  fontWeight: '400' }],
        'label':      ['0.75rem',  { lineHeight: '1rem',    letterSpacing: '0.05em',  fontWeight: '500' }],
      },
      borderRadius: {
        'gc': '4px',
        'gc-md': '8px',
        'gc-pill': '100px',
      },
      boxShadow: {
        'gc-1': '0 1px 2px 0 rgba(60,64,67,.30), 0 1px 3px 1px rgba(60,64,67,.15)',
        'gc-2': '0 1px 2px 0 rgba(60,64,67,.30), 0 2px 6px 2px rgba(60,64,67,.15)',
        'gc-3': '0 4px 8px 3px rgba(60,64,67,.15), 0 1px 3px rgba(60,64,67,.30)',
        'gc-4': '0 6px 10px 4px rgba(60,64,67,.15), 0 2px 3px rgba(60,64,67,.30)',
        'gc-5': '0 8px 12px 6px rgba(60,64,67,.15), 0 4px 4px rgba(60,64,67,.30)',
      },
    },
  },
  plugins: [],
}
