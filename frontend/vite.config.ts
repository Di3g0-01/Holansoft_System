import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: false,
    allowedHosts: true,
    // REQUERIDO para carpetas OneDrive/Dropbox:
    // Los watchers nativos reciben eventos falsos de la sincronización
    // y crashean Vite. Polling con intervalo alto es más estable.
    watch: {
      usePolling: true,
      interval: 10000,      // Mucho más estable en OneDrive
      binaryInterval: 10500,
    },
  }
})
