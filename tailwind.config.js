/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        ink: 'var(--color-ink)',
        muted: 'var(--color-muted)',
        accent: {
          DEFAULT: 'var(--color-accent)',
          soft: 'var(--color-accent-soft)',
          hover: 'var(--color-accent-hover)',
        },
        line: 'var(--color-line)',
      },
      fontFamily: {
        serif: ['Fraunces', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        handwritten: ['Caveat', 'cursive'],
      },
      fontSize: {
        '2xs': ['12px', { lineHeight: '16px' }],
        'xs': ['14px', { lineHeight: '20px' }],
        'sm': ['16px', { lineHeight: '24px' }],
        'base': ['16px', { lineHeight: '24px' }],
        'lg': ['20px', { lineHeight: '28px' }],
        'xl': ['28px', { lineHeight: '36px' }],
        '2xl': ['40px', { lineHeight: '48px' }],
        '3xl': ['64px', { lineHeight: '72px' }],
        '4xl': ['96px', { lineHeight: '104px' }],
      },
      borderRadius: {
        card: '14px',
        pill: '999px',
      },
      boxShadow: {
        'warm-sm': '0 2px 8px -2px rgba(28, 27, 25, 0.05)',
        'warm-md': '0 8px 24px -4px rgba(28, 27, 25, 0.08), 0 2px 6px -1px rgba(28, 27, 25, 0.04)',
        'warm-lg': '0 20px 40px -8px rgba(28, 27, 25, 0.12), 0 4px 12px -2px rgba(28, 27, 25, 0.05)',
        'warm-dark-sm': '0 2px 8px -2px rgba(0, 0, 0, 0.4)',
        'warm-dark-md': '0 8px 24px -4px rgba(0, 0, 0, 0.5), 0 2px 6px -1px rgba(0, 0, 0, 0.3)',
        'warm-dark-lg': '0 20px 40px -8px rgba(0, 0, 0, 0.7), 0 4px 12px -2px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'fade-up': 'fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
        'shutter': 'shutterAnim 1.6s cubic-bezier(0.77, 0, 0.175, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        shutterAnim: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '60%': { transform: 'scale(0.96)', opacity: '1' },
          '100%': { transform: 'scale(1.1)', opacity: '0', pointerEvents: 'none' },
        }
      }
    },
  },
  plugins: [],
};

