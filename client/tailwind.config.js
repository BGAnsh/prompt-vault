/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1d1b1a',
        paper: '#f6f2ea',
        accent: '#ff6b35',
        accentDark: '#d24a1c',
        teal: '#2ec4b6',
        card: 'rgba(255, 255, 255, 0.86)'
      },
      boxShadow: {
        soft: '0 12px 30px rgba(17, 12, 5, 0.12)',
      },
      fontFamily: {
        display: ['"Space Grotesk"', '"Segoe UI"', 'sans-serif'],
        body: ['"IBM Plex Sans"', '"Segoe UI"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
