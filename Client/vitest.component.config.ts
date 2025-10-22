import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    coverage: {
      reporter: ['text', 'lcov']
    },
    name: 'Component Tests',
    include: ['./tests/app/**/*.test.tsx'],
    browser: {
      enabled: true,
      provider: 'playwright',
      headless: true,
      instances: [
        {
          browser: 'chromium'
        },
      ]
    }
  }
})
