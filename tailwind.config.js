export default {
  content: [
    "./index.html",
    "./landing.html",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/js/**/*.js"
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
        sans: ["Geist", "Inter", "system-ui", "sans-serif"],
        inter: ["Inter", "sans-serif"],
      },
      colors: {
        'nexora-bg': '#050B14',
        'adeora-navy': '#050B14',
        'adeora-gradient': '#02122C',
        ice: {
          400: "#7dd3fc",
          500: "#38bdf8",
        },
      },
    },
  },
  plugins: [],
}
