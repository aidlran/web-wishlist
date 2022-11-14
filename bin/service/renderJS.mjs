import { readFile } from 'fs/promises';
import { join } from 'path';

import { DIR_LAYOUTS } from './config.mjs';
import { transform } from 'esbuild';

const onTemplateReady = (() => {

	let template;
	let templateReady = false;
	let templateReadyCallbacks = [];

	readFile(join(DIR_LAYOUTS, 'wishlistInline.js'), 'utf8')
		.then(readTemplate => {
			template = readTemplate;
			templateReady = true;
			for (const callback of templateReadyCallbacks)
				callback(template);
			templateReadyCallbacks = undefined;
		});

	return () => new Promise(resolve => {
		if (templateReady) resolve(template);
		else templateReadyCallbacks.push(resolve);
	});

})();

export async function render(wishlistData) {
	return await onTemplateReady()
		.then(template =>
			transform(template.replace('{wishlistData}', JSON.stringify(wishlistData)), {
				minify: true
			})
		)
		.then(result => result.code);
}

export default render;
