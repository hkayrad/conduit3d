import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		coverage: {
			reporter: ["text", "lcov"],
			reportOnFailure: true,
			exclude: [
				"**/node_modules/**",
				"**/dist/**",
				"**/*.test.*",
				"**/*.config.*",
				"**/coverage/**",
				"**/utils/protos/**",
				"**/workers/**",
			],
		},
		projects: ["./vitest.unit.config.ts", "./vitest.component.config.ts"],
	},
});
