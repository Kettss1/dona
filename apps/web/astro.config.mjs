import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

const isProduction = process.env.NODE_ENV === 'production';

export default defineConfig({
  integrations: [react()],
  site: 'https://Kettss1.github.io',
  base: isProduction ? '/dona' : '/',
  output: 'static',
  server: {
    port: 5173,
  },
});
