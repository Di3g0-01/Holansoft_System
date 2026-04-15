import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: true,
    port: 5173,
    // REQUERIDO para carpetas OneDrive/Dropbox:
    // Los watchers nativos reciben eventos falsos de la sincronización
    // y crashean Vite. Polling con intervalo alto es más estable.
    watch: {
      usePolling: true,
      interval: 2000,       // Revisa cambios cada 2 segundos (no sobrecarga el proceso)
      binaryInterval: 3000,
    },
  }
})
