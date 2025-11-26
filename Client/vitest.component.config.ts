import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			'wkx': '/tests/mocks/wkx.mock.ts',
			'node:buffer': '/tests/mocks/buffer.mock.ts'
		}
	},
	test: {
		coverage: {
			reporter: ['text', 'lcov'],
			reportOnFailure: true,
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
