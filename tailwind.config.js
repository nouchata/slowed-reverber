module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '4rem',
    },
    extend: {
      backgroundImage: {
        'app-input-disabled':
          'repeating-linear-gradient(-55deg,#303236,#303236 10px,#2b2d31 10px,#2b2d31 20px)',
        'app-player-disabled':
          'repeating-linear-gradient(-55deg,#222,#222 10px,#333 10px,#333 20px)',
      },
      colors: {
        app: {
          'primary-color': '#7E22CE',
          display: {
            background: '#000',
          },
          modal: {
            xl: {
              background: '#22252A',
              lighter: '#2C2F35',
            },
          },
          input: {
            border: '#636569',
            bg: '#303236',
          },
        },
        gray: {
          100: '#f7fafc',
          200: '#edf2f7',
          300: '#e2e8f0',
          400: '#cbd5e0',
          500: '#a0aec0',
          600: '#718096',
          700: '#4a5568',
          800: '#2d3748',
          900: '#1a202c',
        },
        blue: {
          100: '#ebf8ff',
          200: '#bee3f8',
          300: '#90cdf4',
          400: '#63b3ed',
          500: '#4299e1',
          600: '#3182ce',
          700: '#2b6cb0',
          800: '#2c5282',
          900: '#2a4365',
        },
      },
      animation: {
        'big-elem-ping': 'big-elem-ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
        'loading-logo-spin': 'loading-logo-spin 10s linear infinite',
        'inject-new-file-rotate':
          'quarter-turn-mid-pause 1.5s ease-in-out infinite',
      },
      keyframes: {
        'big-elem-ping': {
          '0%': { opacity: '80%' },
          '100%': { transform: 'scale(1.3)', opacity: '0' },
        },
        'loading-logo-spin': {
          '0%': { strokeDashoffset: 0 },
          '100%': { strokeDashoffset: 20 },
        },
        'quarter-turn-mid-pause': {
          '0%': { transform: 'rotate(0deg)' },
          '10%': { transform: 'rotate(-30deg)' },
          '50%': { transform: 'rotate(90deg)' },
          '100%': { transform: 'rotate(90deg)' },
        },
      },
    },
  },
  plugins: [],
};
