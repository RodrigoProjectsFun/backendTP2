import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
		host: true, // Allows Vite to listen on all interfaces (necessary for Docker)
		port: 5173,
		watch: {
			usePolling: true, // Ensure hot reload works inside Docker
		},
	},
});
