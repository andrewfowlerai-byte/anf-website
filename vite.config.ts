import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Collapse three.js to a single instance. @react-three/postprocessing pulls in
  // the `postprocessing` package, which bundles its own three; without dedupe the
  // bloom composer operates on a different THREE than the r3f scene and silently
  // no-ops. Deduping makes the glow actually apply.
  resolve: {
    dedupe: ['three', '@react-three/fiber'],
  },
  // Stamped into the bundle at build time and shown in the /experience HUD.
  // Exists because a long-lived SPA tab keeps running the bundle it loaded,
  // across any number of deploys, and we burned an afternoon debugging planet
  // colours that were fixed on the server while a stale tab showed the old sky.
  define: {
    __BUILD_TAG__: JSON.stringify(
      new Date().toLocaleString('en-US', {
        timeZone: 'America/New_York',
        month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
      }) + ' ET',
    ),
  },
})
