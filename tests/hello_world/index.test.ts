import { type BuildArtifact, plugin } from "bun";
import { beforeAll, expect, test } from 'bun:test';
import sveltePlugin from "../../src";
import process from "process";

test('hello world', async () => {
	const build = await Bun.build({
		entrypoints: ['./index.ts'],
		outdir: '.build',
		plugins: [sveltePlugin()],
	});

	console.log('--- BUILD OUTPUT ---');
	build.logs.filter((log) => log.name === 'BuildMessage').forEach(console.log);
	console.log('--- END BUILD OUTPUT ---');

	const outdir = `${process.cwd()}/.build`;

	expect(build.success).toBe(true);
	expect(build.outputs.find((artifact) => artifact.path === `${outdir}/index.js`))
});
