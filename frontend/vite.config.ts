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
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('lucide-react') || id.includes('sonner')) return 'vendor-ui';
            if (id.includes('jspdf') || id.includes('html2canvas') || id.includes('dompurify')) return 'vendor-pdf';
            return 'vendor';
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000, // Elevamos el límite a 1000kB ya que ahora están controlados
  }
})
