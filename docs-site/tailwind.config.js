/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: '#0a0a0a',
        surface: '#111111',
        border: 'rgba(255,255,255,0.08)',
        'border-hover': 'rgba(255,255,255,0.16)',
        text: '#fafafa',
        'text-muted': '#a1a1aa',
        'text-faint': '#71717a',
        accent: '#fafafa',
        'accent-hover': '#e4e4e7',
        'accent-text': '#09090b',
        success: '#34d399',
        danger: '#fb7185',
        warning: '#fbbf24'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace']
      },
      fontSize: {
        'xs': ['0.7rem', { lineHeight: '1.4' }],
        'sm': ['0.8rem', { lineHeight: '1.5' }],
        'base': ['0.9rem', { lineHeight: '1.6' }],
        'lg': ['1.1rem', { lineHeight: '1.6' }],
        'xl': ['1.3rem', { lineHeight: '1.5' }],
        '2xl': ['1.6rem', { lineHeight: '1.4' }],
        '3xl': ['2rem', { lineHeight: '1.3' }]
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem'
      },
      borderRadius: {
        'sm': '6px',
        'DEFAULT': '8px',
        'lg': '12px',
        'xl': '16px'
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)',
        'elevated': '0 12px 40px -8px rgba(0,0,0,0.5)'
      },
      transitionDuration: {
        'fast': '150ms',
        'normal': '250ms',
        'slow': '400ms'
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.16, 1, 0.3, 1)'
      }
    }
  },
  plugins: []
}