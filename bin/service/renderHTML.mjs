import { readFile, writeFile } from 'fs/promises';
import { join} from 'path';

import { minify } from 'html-minifier';

import { DIR_LAYOUTS, TITLE } from './config.mjs';
import renderWishlistInlineJS from './renderJS.mjs';

const MINIFY_CONFIG = {
	collapseBooleanAttributes: true,
	collapseWhitespace: true,
	removeAttributeQuotes: true,
	removeEmptyAttributes: true,
	removeOptionalTags: true,
	removeRedundantAttributes: true
};

const onTemplateReady = (() => {

	let template;
	let templateReady = false;
	let templateReadyCallbacks = [];

	readFile(join(DIR_LAYOUTS, 'template.html'), 'utf8')
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

export function renderMenu(outDir, wishlists) {
	return onTemplateReady()
		.then(async template =>
			writeFile(
				join(outDir, 'index.html'),
				minify(
					template
						.replace('{title}', TITLE ?? "Wishlists")
						.replace('{head}',
							"<link rel=\"stylesheet\" href=\"common.css\">" +
							"<link rel=\"stylesheet\" href=\"menu.css\">" +
							"<script src=\"menu.js\"></script>"
						)
						.replace('{body}',
							"<h1>Wishlists</h1>" + 
							(() => {
								let wishlistsString = "";
								for (const wishlist of wishlists)
									wishlistsString += `<a href="${wishlist.slug}/">${wishlist.name}</a>`;
								return wishlistsString;
							})()
						),
					MINIFY_CONFIG
				)
			)
		);
}

export function renderWishlistPage(outDir, wishlist, nested = false) {
	return onTemplateReady()
		.then(async template =>
			writeFile(
				join(outDir, nested ? wishlist.slug : '', 'index.html'),
				minify(
					template
						.replace('{title}', wishlist.name ?? "Wishlist")
						.replace('{head}',
							`<script>${await renderWishlistInlineJS(wishlist)}</script>` +
							"<link rel=\"stylesheet\" href=\"../common.css\">" +
							"<link rel=\"stylesheet\" href=\"../wishlist.css\">"
						)
						.replace('{body}', ""),
					MINIFY_CONFIG
				)
			)
		);
}
