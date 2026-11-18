/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'] },
      colors: {
        brand: {
          DEFAULT: '#fa6f29',
          seabuckthorn: '#fa9e2e',
          casablanca: '#f7b059',
          rajah: '#f9c77b',
          marzipan: '#f8d79b',
        },
      },
    },
  },
  plugins: [],
}
