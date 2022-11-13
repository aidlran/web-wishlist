#!/usr/bin/env node

import { mkdir, readdir, readFile, rm } from 'fs/promises';
import { basename, dirname, extname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

import { build } from 'esbuild';

import { renderMenu, renderWishlistPage } from './build/renderHTML.mjs';

const CONFIG = await (async () => {
	try {
		return JSON.parse(await readFile('wishlist-config.json', 'utf8'));
	} catch (e) {
		console.log("Couldn't parse wishlist-config.json (or maybe it doesn't exist)");
		console.log("Using default values.");
		return {};
	}
})();

const DIR_SRC  = join(dirname(fileURLToPath(import.meta.url)), '../src/');
const DIR_DATA = resolve(CONFIG.wishlists ?? 'wishlists/');
const DIR_OUT  = resolve(CONFIG.out ?? 'dist/');

const ESBUILD_OPTIONS = {
	outdir: DIR_OUT,
	bundle: true,
	minify: true
};

// Clear OUT directory
await readdir(DIR_OUT)
	.then(async dirList => {
		for (const dirent of dirList) {
			await rm(join(DIR_OUT, dirent), {
				recursive: true
			});
		}
	})
	.catch(async err => {
		await mkdir(DIR_OUT, {
			recursive: true
		});
	});

// Process wishlists
readdir(DIR_DATA, { withFileTypes: true })
	.then(async directory => {

		// Filter down to JSON files and map to an array of file names
		directory = directory
			.filter(dirent => dirent.isFile() && extname(dirent.name) === '.json')
			.map(dirent => dirent.name);

		switch (directory.length) {
			case 0:
				renderWishlistPage(join(DIR_OUT, 'index.html'), []);
				break;
			case 1:
				renderWishlistPage(join(DIR_OUT, 'index.html'), JSON.parse(await readFile(join(DIR_DATA, directory[0]), 'utf8')));
				break;
			default:
				build(Object.assign(ESBUILD_OPTIONS, {
					entryPoints: [
						join(DIR_SRC, 'menu.js')
					]
				}));
				const MENU_DATA = [];
				for (const FILE of directory) try {
					const WISHLIST = JSON.parse(await readFile(join(DIR_DATA, FILE)));
					WISHLIST.slug = basename(FILE, extname(FILE));
					mkdir(join(DIR_OUT, WISHLIST.slug), { recursive: true })
						.then(() => renderWishlistPage(join(DIR_OUT, WISHLIST.slug, 'index.html'), WISHLIST, true));
					MENU_DATA.push(WISHLIST);
				} catch (error) {
					console.log(`WARNING: Error parsing ${FILE}. Skipping. (Reason: ${error.message})`);
				}
				renderMenu(DIR_OUT, MENU_DATA);
				break;
		}
	})
	.catch(console.error);

// Build JS/CSS with esbuild
// Menu.js is only built if there's multiple lists
build(Object.assign(ESBUILD_OPTIONS, {
	entryPoints: [
		join(DIR_SRC, 'wishlist.js'),
		join(DIR_SRC, 'common.css')
	]
}));
