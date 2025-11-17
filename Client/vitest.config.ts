import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		coverage: {
			reporter: ["text", "lcov"],
		},
		projects: ["./vitest.unit.config.ts", "./vitest.component.config.ts"],
	},
});
