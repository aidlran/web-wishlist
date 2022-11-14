import { join } from 'path';

import esbuild from 'esbuild';

import { DIR_OUT, DIR_SRC } from './config.mjs';

/**
 * Wrapper for `esbuild.build`.
 * @type {{
 * (entryPoint:string) => Promise<esbuild.BuildResult>;
 * (options: esbuild.BuildOptions, ...entryPoints: string) => Promise<esbuild.BuildResult>;
 * }}
 */
export const build = (options, ...entryPoints) => {
	if (typeof options === 'string') {
		entryPoints.push(options);
		options = {};
	}
	entryPoints = entryPoints.map(value =>
		value.startsWith('/') ? value : join(DIR_SRC, value)
	);
	return esbuild.build(Object.assign({
		bundle: true,
		minify: true,
		outdir: DIR_OUT,
		entryPoints
	}, options));
};

export default build;
