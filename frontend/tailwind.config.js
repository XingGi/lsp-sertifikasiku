/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", "./node_modules/@tremor/react/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Warna 'brand' utama kita (merah)
        "brand-red": "#DC2626", // Ini adalah kode hex untuk red-600
        "brand-red-dark": "#B91C1C", // red-700 untuk hover
      },
      animation: {
        blob: "blob 7s infinite",
      },
      keyframes: {
        blob: {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -50px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" },
        },
      },
    },
  },
  // Tremor configuration
  tremor: {
    theme: {
      light: {
        colors: {
          // Atur warna utama Tremor agar sesuai dengan warna brand kita
          primary: "#DC2626", // brand-red
          "background-subtle": "#F1F5F9",
        },
        borderRadius: {
          // Atur sudut default Tremor agar cocok dengan rounded-lg
          "tremor-small": "0.5rem",
          "tremor-default": "0.5rem",
          "tremor-full": "9999px",
        },
      },
    },
  },
  plugins: [],
};
