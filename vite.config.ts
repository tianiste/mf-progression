import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    // `npm run dev:api` serves /api on 8787; without it the page falls back to Bazaar-only prices.
    proxy: { '/api': 'http://localhost:8787' },
  },
})
