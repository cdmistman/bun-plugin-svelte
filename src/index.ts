import type { BunPlugin, PluginBuilder } from 'bun';
import { OnLoadResult } from 'bun';
import { readFile, stat } from 'fs/promises';
import { CompileOptions, compile } from 'svelte/compiler';
import { basename } from 'path';
import { assert } from 'console';

export type SveltePluginOptions = Partial<{
	// /**
	//  * The directory to store cached Svelte components.
	//  *
	//  * If not specified, then uses `.svelte` directory in the output directory
	//  * if it's specified for the build, else in the project root.
	//  *
	//  * @example
	//  * ```ts
	//  * import sveltePlugin from 'bun-plugin-svelte';
	//  *
	//  * // builds in .svelte-build directory of project root
	//  * Bun.build({
	//  *   plugins: [sveltePlugin({ buildDir: '.svelte-build' })],
	//  * });
	//  *
	//  * // builds in .build/.svelte directory of project root
	//  * Bun.build({
	//  *   outdir: '.build',
	//  *   plugins: [sveltePlugin()],
	//  * });
	//  *
	//  * // builds in .svelte directory of project root
	//  * Bun.build({
	//  *   plugins: [
	//  *     sveltePlugin(),
	//  *   ],
	//  * });
	//  * ```
	//  */
	// buildDir: string;

	/**
	 * The options to pass to `svelte.compile`. See documentation at https://svelte.dev/docs#compile-time-svelte-compile.
	 *
	 * These options overwrite any options set by this plugin.
	 */
	compileOptions: CompileOptions;

	/**
	 * The regular expression to match Svelte components.
	 */
	include: RegExp;
}>;

export default function sveltePlugin(options: SveltePluginOptions = {}): BunPlugin {
	const {
		compileOptions = {},
		include = /\.svelte$/,
	} = options;

	return {
		name: 'svelte',
		setup(build: PluginBuilder) {
			build.onLoad({ filter: include! }, async ({ loader, namespace, path }) => {
				// const metadata = await stat(path);

				const defaultCompileOptions: CompileOptions = {
					css: false,
					filename: path,
					immutable: true,

					// TODO: once Bun supports cjs, use cjs
					// TODO: I'm not sure what to do if it's `iife`?
					// format: build.config.format === 'cjs' ? 'cjs' : 'esm',
				};

				if (build.config.minify !== undefined) {
					if (typeof build.config.minify === 'boolean') {
						defaultCompileOptions.preserveComments = !build.config.minify;
						defaultCompileOptions.preserveWhitespace = !build.config.minify;
					} else {
						defaultCompileOptions.preserveComments = !build.config.minify.syntax;
						defaultCompileOptions.preserveWhitespace = !build.config.minify.whitespace;
					}
				}

				if (build.config.sourcemap && build.config.sourcemap !== 'none') {
					defaultCompileOptions.enableSourcemap = true;
				}

				const { js, css, warnings, stats } = compile(await readFile(path, 'utf-8'), {
					...defaultCompileOptions,
					...compileOptions,
				});
				console.debug(`compiled ${path} in ${stats.timings.total} ms`);
				warnings.forEach(console.warn);

				if (defaultCompileOptions.enableSourcemap) {
					const jsURL = build.config.sourcemap === 'inline' ? js.map.toUrl() : `${path}.js.map`;
					js.code += `\n//# sourceMappingURL=${jsURL}`;

					const cssURL = build.config.sourcemap === 'inline' ? css.map.toUrl() : `${path}.css.map`;
					css.code += `\n/*# sourceMappingURL=${cssURL} */`;
				}

				assert(typeof js === 'object')
				assert(typeof js.code === 'string')


				return {
					contents: js.code,
					loader: 'js',
				} as OnLoadResult;
			});
		},
	};
}
