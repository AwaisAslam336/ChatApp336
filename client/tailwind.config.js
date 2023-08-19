/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      padding: {
        "5%": "5%",
      },
      fontSize: {
        "2rem": "2rem",
        "1rem": "1rem",
      },
      height: {
        "85vh": "85vh",
        "90vh": "90vh",
      },
    },
  },
  plugins: [],
};
