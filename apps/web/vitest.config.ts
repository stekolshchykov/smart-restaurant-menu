import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
	plugins: [
		svelte({
			hot: !process.env.VITEST,
		}),
	],
	test: {
		name: '@digital-menu/web',
		include: ['src/**/*.{test,spec}.{js,ts}'],
		environment: 'jsdom',
		globals: false,
	},
});
