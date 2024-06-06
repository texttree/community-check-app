/** @type {import('tailwindcss').Config} */
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
        'deep-space': '#3C6371',
        'desaturated-cyan': '#609295',
        'peru-orange': '#C68D39',
        'platinum-white': '#E3E3E3',
        'independence-gray': '#475569',
        'foil-silver': '#AEAEAE',
        'bright-gray': '#EDEDED',
        'raisin-black': '#262626',
      },
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
