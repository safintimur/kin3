import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}', './features/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: '#e5e7eb',
        background: '#f8fafc',
        foreground: '#0f172a',
        card: '#ffffff',
        muted: '#6b7280',
        primary: '#1d4ed8',
        ring: '#94a3b8'
      }
    }
  },
  plugins: []
};

export default config;
