import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f4ff',
          100: '#dde8ff',
          200: '#c3d3f8',
          300: '#96b3f2',
          600: '#1a56db',
          700: '#1342b8',
          800: '#0f2f8f',
          900: '#0f2167',
          950: '#080f3a',
        },
        gold: {
          400: '#f5c842',
          500: '#e9a229',
          600: '#d4851a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
