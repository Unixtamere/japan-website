import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// In development, the API + uploads are served by the Express server
// (server/index.js on :3001). Vite forwards those paths to it so the app
// behaves the same as production. Run both together with `npm run dev:all`.
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Expose the dev server on your LAN so phones/other devices can reach it.
    host: true,
    port: 5174,
    strictPort: true,
    // Hostnames allowed to reach the dev server (Vite blocks unknown hosts).
    allowedHosts: ['lab1.cbot1.fr'],
    proxy: {
      '/api': 'http://localhost:3001',
      '/uploads': 'http://localhost:3001',
    },
    watch: {
      // Don't watch the character images: on Windows, dropping a new image
      // here can briefly lock the file and crash the dev server's watcher.
      ignored: ['**/node_modules/**', '**/.git/**', '**/public/characters/**'],
    },
  },
})
