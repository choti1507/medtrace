/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Arial", "sans-serif"],
      },
      colors: {
        dark: {
          50: "#f8fafc",
          100: "#1e293b",
          200: "#1a2236",
          300: "#151c2e",
          400: "#111827",
          500: "#0f1629",
          600: "#0d1220",
          700: "#0a0e1a",
          800: "#070a14",
          900: "#04060e",
        },
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};
