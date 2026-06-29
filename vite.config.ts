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
})
