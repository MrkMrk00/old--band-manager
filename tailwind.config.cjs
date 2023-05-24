/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{jsx,tsx,mdx}',
  ],
  safelist: [
    {
      pattern: /(bg|border)-(rose|pink|fuchsia|purple|blue|sky|cyan|teal|green|lime|yellow|orange|red|gray|slate)-(100|200|300|400|500|600|700|800)/,
      variants: ['hover', 'focus'],
    },
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
