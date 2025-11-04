/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)'],
        mono: ['var(--font-geist-mono)']
      }
    },
  },
  plugins: [
    require("daisyui"),
  ],
  darkMode: 'media',
  daisyui: {
    themes: [
      {
        light: {
          "primary": "#8b9dc3",
          "secondary": "#a8b5d1",
          "accent": "#c8d5e8",
          "neutral": "#e8ecf3",
          "base-100": "#f5f7fa",
          "base-200": "#eef1f5",
          "base-300": "#e1e6ed",
          "base-content": "#3e4c63",
          "info": "#7da2d1",
          "success": "#a8c8b8",
          "warning": "#e5c5a3",
          "error": "#d4a5a5",
        },
        dark: {
          "primary": "#6b7fa3",
          "secondary": "#8895b1",
          "accent": "#a8b5c8",
          "neutral": "#2a3442",
          "base-100": "#1a1f2e",
          "base-200": "#151a25",
          "base-300": "#0f131c",
          "base-content": "#d4dae6",
          "info": "#5d82b1",
          "success": "#88a898",
          "warning": "#c5a583",
          "error": "#b48585",
        },
      },
    ],
  },
};
