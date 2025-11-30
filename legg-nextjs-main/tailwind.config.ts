import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core theme colors
        bg: {
          DEFAULT: '#031622',
          soft: '#071b28',
          softer: '#0b2231',
        },
        accent: {
          DEFAULT: '#3fd0ff',
          soft: 'rgba(63, 208, 255, 0.2)',
        },
        text: {
          DEFAULT: '#f5f7fb',
          muted: '#9bb0c7',
        },
        border: '#193448',
        danger: '#ff5c7a',
        // Job colors
        job: {
          pink: '#ff6fae',
          blue: '#2b9df4',
          lime: '#95e062',
          yellow: '#ffd166',
          coral: '#ff3b6b',
          violet: '#a78bfa',
          teal: '#4fd1c5',
          orange: '#ff922b',
          green: '#2ec27e',
        },
        // Additional specific colors
        'now-line': '#ff2d55',
        'gold-border': '#ffd500',
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
      },
      fontSize: {
        'xxs': '9px',
      },
      spacing: {
        '4.5': '18px',
        '15': '60px',
        '65': '260px',
        '75': '300px',
        '95': '380px',
      },
      borderRadius: {
        'pill': '999px',
      },
      boxShadow: {
        'card': '0 4px 10px rgba(0, 0, 0, 0.35)',
        'card-lg': '0 10px 24px rgba(0, 0, 0, 0.6)',
        'modal': '0 10px 30px rgba(0, 0, 0, 0.7)',
        'now-line': '0 0 6px rgba(255, 45, 85, 0.7)',
      },
      backgroundImage: {
        'app-gradient': 'radial-gradient(circle at top, #12334b 0%, #082032 55%)',
        'app-fullscreen': 'radial-gradient(circle at top, #0d2233 0%, #020c14 55%)',
        'body-gradient': 'radial-gradient(circle at top, #10263a 0, #020c14 55%)',
        'sidebar-gradient': 'linear-gradient(180deg, #061725, #050f1b)',
        'day-column-gradient': 'radial-gradient(circle at top, #10273a 0%, #04121f 60%)',
        'notes-panel-gradient': 'linear-gradient(180deg, #071c2c, #06121f)',
      },
      minHeight: {
        'day-body': '520px',
      },
    },
  },
  plugins: [],
};

export default config;
