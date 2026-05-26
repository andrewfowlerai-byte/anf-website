/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        midnight: {
          50: '#E8EBF2',
          100: '#C5CDDC',
          300: '#7A89A6',
          500: '#3A4A6B',
          700: '#1A2B4A',
          900: '#0B1A33',
          950: '#060F1F',
        },
        silver: {
          100: '#F5F7FA',
          300: '#D6DBE3',
          400: '#B8BFCC',
          500: '#9AA3B2',
          700: '#5C6478',
        },
        flame: {
          300: '#FBB088',
          400: '#F89259',
          500: '#F26B1D',
          600: '#D9550E',
          700: '#A6420C',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      backgroundImage: {
        'midnight-radial':
          'radial-gradient(ellipse at top, #1A2B4A 0%, #0B1A33 50%, #060F1F 100%)',
      },
      boxShadow: {
        'flame-glow': '0 0 24px -4px rgba(242, 107, 29, 0.45)',
      },
    },
  },
  plugins: [],
}
