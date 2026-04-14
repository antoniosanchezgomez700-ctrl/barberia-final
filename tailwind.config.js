/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Soporte para dark mode manual o dinámico
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Usaremos Inter como tipografía elegante
      },
      colors: {
        primary: {
          50: '#fefce8',
          400: '#eab308',
          500: '#d97706', // Dorado clásico
          600: '#b45309',
        },
        dark: {
          bg: '#0f172a',    // Fondo oscuro premium
          card: '#1e293b',  // Tarjetas modo oscuro
          text: '#f8fafc',  // Texto en modo oscuro
        }
      }
    },
  },
  plugins: [],
}
