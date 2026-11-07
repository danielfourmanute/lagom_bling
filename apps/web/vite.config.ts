import { defineConfig, loadEnv } from 'vite';
import { fileURLToPath } from 'node:url';
import vue from '@vitejs/plugin-vue';

// Em dev, o proxy injeta a chave administrativa do .env da raiz; o navegador não a conhece.
const rootEnv = loadEnv('development', fileURLToPath(new URL('../..', import.meta.url)), '');

export default defineConfig({
  plugins: [vue()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.API_PROXY_TARGET ?? 'http://127.0.0.1:3000',
        changeOrigin: true,
        headers: rootEnv.ADMIN_API_TOKEN ? { Authorization: `Bearer ${rootEnv.ADMIN_API_TOKEN}` } : {},
      },
    },
  },
});
