export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#ecfdf7',
          100: '#d1faec',
          200: '#a7f3d6',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#0b8f6a',
          700: '#0a7458',
          800: '#085c46',
          900: '#073b2e',
          950: '#04231c',
        },
      },
      keyframes: {
        'aurora-first': {
          '0%,100%': { transform: 'translate(-10%,-10%) rotate(0deg)' },
          '50%': { transform: 'translate(10%,10%) rotate(180deg)' },
        },
        'aurora-second': {
          '0%,100%': { transform: 'translate(10%,10%) rotate(0deg)' },
          '50%': { transform: 'translate(-10%,-10%) rotate(180deg)' },
        },
        'aurora-third': {
          '0%,100%': { transform: 'translate(-5%,5%) rotate(0deg)' },
          '50%': { transform: 'translate(5%,-5%) rotate(180deg)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'border-beam': {
          '100%': { offsetDistance: '100%' },
        },
        meteor: {
          '0%': { transform: 'rotate(215deg) translateX(0)', opacity: '1' },
          '70%': { opacity: '1' },
          '100%': { transform: 'rotate(215deg) translateX(-500px)', opacity: '0' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'glow-pulse': {
          '0%,100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        'aurora-first': 'aurora-first 20s ease-in-out infinite',
        'aurora-second': 'aurora-second 25s ease-in-out infinite',
        'aurora-third': 'aurora-third 30s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
        meteor: 'meteor 5s linear infinite',
        'fade-up': 'fade-up 0.5s ease-out forwards',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
      },
    },
  },
}
