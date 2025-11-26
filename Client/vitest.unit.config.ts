import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    test: {
        coverage: {
            reporter: ['text', 'lcov'],
            reportOnFailure: true,
        },
        name: 'Unit Tests',
        environment: 'jsdom',
        include: ['./tests/lib/**/*.test.ts'],
    },
})