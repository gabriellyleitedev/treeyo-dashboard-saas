/** @type {import('tailwindcss').Config} */
export default {
  important: true, 
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {

      keyframes: {
        barGrow: {
          'from': { transform: 'scaleY(0)', opacity: '0' },
          'to': { transform: 'scaleY(1)', opacity: '1' },
        }
      },
      animation: {
        barGrow: 'barGrow 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards',
      }
    },
  },
  plugins: [],
}