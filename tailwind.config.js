/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FFF5F7',
          100: '#FFE4E8',
          200: '#FECDD6',
          300: '#FDA4AF',
          400: '#FB7185',
          500: '#F43F5E',
          600: '#E11D48',
          700: '#BE123C',
          800: '#9F1239',
          900: '#881337',
        },
        blush: {
          bg: '#FFF5F7',
          card: '#FFFFFF',
          border: '#FFE3EA',
          soft: '#FDF2F4',
          accent: '#FF4D79',
          glow: 'rgba(255, 77, 121, 0.15)',
        },
        phase: {
          menstrual: '#F43F5E',
          follicular: '#EC4899',
          ovulation: '#F59E0B',
          luteal: '#8B5CF6',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Outfit"', '"Plus Jakarta Sans"', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(244, 63, 94, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.03)',
        'float': '0 12px 32px -4px rgba(244, 63, 94, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.04)',
        'glow': '0 0 24px -2px rgba(244, 63, 94, 0.25)',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.04)', opacity: '0.85' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.25s ease-out forwards',
      }
    },
  },
  plugins: [],
}
