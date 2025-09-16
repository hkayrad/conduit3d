import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
// import fs from 'fs'; // Removed because 'fs' is not available in Vite's frontend context

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), nodePolyfills()],
  server: {
    https: {
      key: 'localhost.key',
      cert: 'localhost.crt',
    },
    host: 'localhost',
    port: 3000
  },
  preview: {
    https: {
      key: 'localhost.key',
      cert: 'localhost.crt',
    },
    host: 'localhost',
    port: 3000
  }
})
