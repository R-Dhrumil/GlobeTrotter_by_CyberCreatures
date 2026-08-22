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
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#ea580c',
          600: '#c2410c',
          700: '#9a3412',
          800: '#7c2d12',
          900: '#431407',
        },
        earth: {
          50: '#fbf9f6',
          100: '#f4ede4',
          200: '#e8dbcc',
          300: '#d7c1a9',
          400: '#c1a182',
          500: '#ae8664',
          600: '#9b7152',
          700: '#7e5a42',
          800: '#674a38',
          900: '#543d30',
        },
        forest: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'premium': '0 10px 30px -5px rgba(28, 25, 23, 0.08), 0 4px 6px -2px rgba(28, 25, 23, 0.03)',
        'floating': '0 20px 40px -15px rgba(0, 0, 0, 0.12)',
      }
    },
  },
  plugins: [],
}
