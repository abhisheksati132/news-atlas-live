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
        sans: ["IBM Plex Sans", "system-ui", "sans-serif"],
      },
      colors: {
        ice: {
          400: "#7dd3fc",
          500: "#38bdf8",
        },
      },
    },
  },
  plugins: [],
}
