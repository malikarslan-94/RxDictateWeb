import { fileURLToPath, URL } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

/** Where clinic-api runs on the development machine (clinic-api/.env PORT). */
const DEV_API_ORIGIN = 'http://localhost:3000';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: DEV_API_ORIGIN,
        changeOrigin: true,
        // To the browser the API is on the page's own origin, so CORS doesn't
        // apply. The browser still sends Origin on a POST, and clinic-api's
        // allow-list refuses an origin it doesn't know ("Origin not
        // allowed"). Dropping it here makes the dev server's requests look
        // like the API's other non-browser callers.
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => proxyReq.removeHeader('origin'));
        },
      },
    },
  },
});
