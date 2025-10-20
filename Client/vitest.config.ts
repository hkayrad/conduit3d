import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        environment: 'jsdom', // or 'happy-dom' for a lighter alternative
        coverage: {
            reporter: ['text', 'lcov']
        }
    }
})