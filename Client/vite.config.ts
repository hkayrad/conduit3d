import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import fs from 'fs'; // Removed because 'fs' is not available in Vite's frontend context

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: 'localhost-key.pem',
      cert: 'localhost.pem',
    },
    host: 'localhost',
    port: 3000
  },
  preview: {
    https: {
      key: 'localhost-key.pem',
      cert: 'localhost.pem',
    },
    host: 'localhost',
    port: 3000
  }
})
