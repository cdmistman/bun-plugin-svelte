import type { BunPlugin, PluginBuilder } from 'bun';

export interface SveltePluginOptions {
	/**
	 * The directory to store cached Svelte components.
	 *
	 * If not specified, then uses `.svelte` directory in the output directory
	 * if it's specified for the build, else in the project root.
	 *
	 * @example
	 * ```ts
	 * import sveltePlugin from 'bun-plugin-svelte';
	 *
	 * // builds in .svelte-build directory of project root
	 * Bun.build({
	 *   plugins: [sveltePlugin({ buildDir: '.svelte-build' })],
	 * });
	 *
	 * // builds in .build/.svelte directory of project root
	 * Bun.build({
	 *   outdir: '.build',
	 *   plugins: [sveltePlugin()],
	 * });
	 *
	 * // builds in .svelte directory of project root
	 * Bun.build({
	 *   plugins: [
	 *     sveltePlugin(),
	 *   ],
	 * });
	 * ```
	 */
	buildDir: string;

	/**
	 * Enables caching of Svelte components.
	 */
	cache: boolean;
}

export default function ({ buildDir, cache = true }: Partial<SveltePluginOptions>): BunPlugin {
	return {
		name: 'bun-plugin-svelte',
		setup(build: PluginBuilder) {
			const cacheDir = cache
				? null
				: buildDir ?? build.config.outdir?.concat('/.svelte') ?? '.svelte';
		},
	};
}
