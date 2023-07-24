/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  safelist: [
    { pattern: /rounded[\w-]/ }
  ],
  theme: {},
  plugins: [],
}
