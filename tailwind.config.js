/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        'ming-blue': '#3C6E71',
        'deep-space': '#345B5F',
        'dark-slate-gray': '#24585B',
        'desaturated-cyan': '#609295',
        'peru-orange': '#C68D39',
        'platinum-white': '#E3E3E3',
        'independence-gray': '#475569',
        'foil-silver': '#AEAEAE',
        'bright-gray': '#EDEDED',
        'raisin-black': '#262626',
        'smoky-white': '#ECF1F1',
        'ghost-white': '#D8E6E6',
      },
      fontFamily: {
        montserrat: ['var(--font-montserrat)', 'sans-serif'],
        sans: ['var(--font-roboto)', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
}
