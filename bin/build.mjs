#!/usr/bin/env node

import { mkdir, readdir, rename, rm, rmdir } from 'fs/promises';
import { basename, dirname, extname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

import { build } from 'esbuild';

import readJSON from './build/readJSON.mjs';
import { renderMenu, renderWishlistPage } from './build/renderHTML.mjs';

const DIR_BIN     = dirname(fileURLToPath(import.meta.url));
const DIR_DEFAULT = join(DIR_BIN, '../default/');
const DIR_SRC     = join(DIR_BIN, '../src/');

const CONFIG = Object.assign(
	await readJSON(join(DIR_DEFAULT, 'wishlist-config.json')),
	await readJSON('wishlist-config.json') ?? (() => {
		console.log("Using default values.");
		return {};
	})()
);

const DIR_DATA = resolve(CONFIG.wishlists);
const DIR_OUT  = resolve(CONFIG.out);

const ESBUILD_OPTIONS = {
	outdir: DIR_OUT,
	bundle: true,
	minify: true
};

// Clear OUT directory
await readdir(DIR_OUT)
	.catch(async err => {
		await mkdir(DIR_OUT, {
			recursive: true
		});
	})
	.then(async dirList => {
		for (const dirent of dirList) {
			await rm(join(DIR_OUT, dirent), {
				recursive: true
			});
		}
	});

// Process wishlists
readdir(DIR_DATA, { withFileTypes: true })
	.catch(error => {
		console.error(`Error: Couldn't read wishlists directory "${CONFIG.wishlists}". (Reason: ${error.message})`);
		process.exit(1);
	})
	.then(directory => {

		// Filter down to JSON files and map to an array of file names
		directory = directory
			.filter(dirent => dirent.isFile() && extname(dirent.name) === '.json')
			.map(dirent => dirent.name);

		const MENU_DATA = [];
		let parsedCount = 0;
		let renderedCount = 0;
		let lastRendered;

		if (directory.length == 0) end();

		else for (const fileName of directory) {
			readJSON(join(DIR_DATA, fileName)).then(wishlist => {

				if (!wishlist) {
					console.log(`Skipping ${fileName}`);
					++parsedCount;
					end();
				}

				else {
					wishlist.slug ??= basename(fileName, extname(fileName));
					MENU_DATA.push(wishlist);
					mkdir(join(DIR_OUT, wishlist.slug), { recursive: true })
						.then(() =>
							renderWishlistPage(join(DIR_OUT, wishlist.slug, 'index.html'), wishlist))
						.then(() => {
							lastRendered = wishlist.slug;
							++parsedCount;
							++renderedCount;
							end();
						});
				}
			});
		}

		function end() {
			if (parsedCount == directory.length) {
				switch (renderedCount) {
					case 0:
						renderWishlistPage(join(DIR_OUT, 'index.html'), []);
						break;
					case 1:
						rename(join(DIR_OUT, lastRendered, 'index.html'), join(DIR_OUT, 'index.html'))
							.then(() => rmdir(join(DIR_OUT, lastRendered)));
						break;
					default:
						build(Object.assign(ESBUILD_OPTIONS, {
							entryPoints: [
								join(DIR_SRC, 'menu.js')
							]
						}));
						renderMenu(DIR_OUT, MENU_DATA);
						break;
				}
			}
		}
	});

// Build JS/CSS with esbuild
// Menu.js is only built if there's multiple lists
build(Object.assign(ESBUILD_OPTIONS, {
	entryPoints: [
		join(DIR_SRC, 'wishlist.js'),
		join(DIR_SRC, 'common.css')
	]
}));
