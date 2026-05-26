module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class', // enable class-based dark mode
  theme: {
    extend: {
      colors: {
        'dark-bg': '#0a0a0a',
        'neon-blue': '#00eaff',
        'glass-white': 'rgba(255,255,255,0.05)',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        neon: '0 0 15px #00eaff',
      },
    },
  },
  plugins: [],
};
