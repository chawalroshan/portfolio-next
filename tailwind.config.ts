import type { Config } from 'tailwindcss';

// Ported from the Vite app's tailwind.config.js. The app styles almost
// entirely with inline CSS variables; Tailwind is used for icon sizing
// utilities (w-4 h-4, etc.), so the default theme is preserved as-is.
const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
