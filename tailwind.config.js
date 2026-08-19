/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#171512",
        paper: "#FBF8F2",
        line: "#E7E0D3",
        brand: {
          50: "#EAFBF4",
          100: "#CFF4E4",
          400: "#1FB980",
          500: "#0E9C6B",
          600: "#0B7D56",
          700: "#095F42",
        },
        mint: "#2FBE73",
        amber: "#DB8A25",
        rose: "#D8425A",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(23,21,18,0.05), 0 10px 28px -14px rgba(23,21,18,0.18)",
        pop: "0 14px 34px -10px rgba(14,156,107,0.4)",
      },
      borderRadius: {
        xl2: "1.5rem",
      },
      backgroundImage: {
        "grain-radial":
          "radial-gradient(circle at 15% 10%, rgba(14,156,107,0.10), transparent 45%), radial-gradient(circle at 85% 0%, rgba(219,138,37,0.10), transparent 40%)",
      },
    },
  },
  plugins: [],
};
