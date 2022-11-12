#!/usr/bin/env node

import { mkdir, readdir, readFile, rm } from 'fs/promises';
import { basename, dirname, extname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

import { build } from 'esbuild';

import { renderMenu, renderPage } from './build/renderHTML.mjs';

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

		directory = directory
			.filter(dirent => dirent.isFile() && extname(dirent.name) === '.json')
			.map(dirent => dirent.name);

		switch (directory.length) {
			case 0:
				renderPage(join(DIR_OUT, 'index.html'), []);
				break;
			case 1:
				renderPage(join(DIR_OUT, 'index.html'), JSON.parse(await readFile(join(DIR_DATA, directory[0]), 'utf8')));
				break;
			default:
				const wishlists = [];
				for (const wishlistFile of directory) {
					const wishlist = JSON.parse(await readFile(join(DIR_DATA, wishlistFile)));
					wishlist.slug = basename(wishlistFile, extname(wishlistFile));
					mkdir(join(DIR_OUT, wishlist.slug), { recursive: true })
						.then(() => renderPage(join(DIR_OUT, wishlist.slug, 'index.html'), wishlist));
					wishlists.push(wishlist);
				}
				renderMenu(DIR_OUT, wishlists);
		}
	})
	.catch(() => renderPage(join(DIR_OUT, 'index.html'), []));

// Build JS/CSS with esbuild
build({
	entryPoints: [
		join(DIR_SRC, 'menu.js'),
		join(DIR_SRC, 'wishlist.js'),
		join(DIR_SRC, 'common.css'),
	],
	outdir: DIR_OUT,
	bundle: true,
	minify: true
});
