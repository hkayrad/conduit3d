import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vite.dev/config/
/// <reference types="vitest/config" />
export default defineConfig({
	plugins: [
		react(),
		nodePolyfills({
			// Disable globals that might conflict
			globals: {
				global: false,
			},
			// Only include specific polyfills you need
			include: ["buffer", "process", "stream", "path", "util"],
		}),
	],
	worker: {
		format: "es",
	},
	build: {
		rollupOptions: {
			// Ensure child_process and other Node.js modules are externalized in browser build
			external: ["child_process", "fs", "net", "tls", "http", "https"],
		},
	},
	server: {
		https: {
			key: "localhost.key",
			cert: "localhost.crt",
		},
		host: "localhost",
		port: 3000,
	},
	preview: {
		https: {
			key: "localhost.key",
			cert: "localhost.crt",
		},
		host: "localhost",
		port: 3000,
	},
});
