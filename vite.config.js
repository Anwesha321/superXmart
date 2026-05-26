import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        premiumCard: resolve(__dirname, 'pages/premium-card.html'),
        sellerDashboard: resolve(__dirname, 'pages/seller-dashboard.html'),
      },
    },
  },
  server: {
    port: 5173,
    host: true
  }
});
