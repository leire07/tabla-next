/** @type {import('tailwindcss').Config} */
const {nextui} = require("@nextui-org/react");

module.exports = {
  content: ["./src/**/*.{html,js, tsx}",
  "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  darkMode: "class",
  plugins: [  
    nextui({
      themes: {
        dark: {
          colors: {
            primary: {
              DEFAULT: "#F98317",
              foreground: "#000000",
            },
            secondary: {
              DEFAULT: "#BD6ED9",
            },
          },
        },
        light: {
          colors: {
            primary: {
              DEFAULT: "#F98317",
              foreground: "#000000",
            },
            secondary: {
              DEFAULT: "#BD6ED9",
            },
          },
        },
      },
    }),
  ],
}
