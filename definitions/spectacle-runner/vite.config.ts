import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
	plugins: [react(), cloudflare()],
	build: {
		minify: true,
		sourcemap: "inline",
		rollupOptions: {
			output: {
				sourcemapExcludeSources: false,
			},
		},
	},
	css: {
		devSourcemap: true,
	},
	server: {
		allowedHosts: true,
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	optimizeDeps: {
		include: ["react", "react-dom", "spectacle"],
		force: true,
	},
	define: {
		global: "globalThis",
	},
	cacheDir: "node_modules/.vite",
});
