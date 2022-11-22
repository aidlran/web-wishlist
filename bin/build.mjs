#!/usr/bin/env node

import { mkdir, readdir, readFile, rename, rm, rmdir, writeFile } from 'fs/promises';
import { basename, extname, join } from 'path';

import cloneDirStructure from './service/cloneDir.mjs';
import Config from './service/config.mjs';
import esbuild from './service/esbuild.mjs';
import readJSON from './service/readJSON.mjs';
import HTML from './service/renderHTML.mjs';

// Clear OUT directory
await rm(Config.DIR_OUT, { recursive: true })
	.catch(() => {
		/* directory doesn't exist */
	})
	.finally(() =>
		mkdir(Config.DIR_OUT, { recursive: true })
	);

// Process wishlists
readdir(Config.DIR_WISHLISTS, { withFileTypes: true })
	.catch(error => {
		console.error(`Error: Couldn't read wishlists directory "${Config.DIR_WISHLISTS}". (Reason: ${error.message})`);
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
			readJSON(join(Config.DIR_WISHLISTS, fileName)).then(wishlist => {

				if (!wishlist) {
					console.log(`Skipping ${fileName}`);
					++parsedCount;
					end();
				}

				else {
					wishlist.slug ??= basename(fileName, extname(fileName));
					MENU_DATA.push(wishlist);
					mkdir(join(Config.DIR_OUT, wishlist.slug), { recursive: true })
						.then(() =>
							HTML.renderWishlistPage(Config.DIR_OUT, wishlist, true))
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
						HTML.renderWishlistPage(Config.DIR_OUT, []);
						break;
					case 1:
						// Only one was rendered, so we don't need to do a menu
						// so move the only rendered wishlist up one level
						const newFilePath = join(Config.DIR_OUT, 'index.html');
						rename(join(Config.DIR_OUT, lastRendered, 'index.html'), newFilePath)
							.then(() => {
								rmdir(join(Config.DIR_OUT, lastRendered));
								return readFile(newFilePath, 'utf8');
							})
							.then(html =>
								// Rewrite but get rid of all '../' not preceded by a '/'
								// i.e. all relative file links go up one less parent level
								writeFile(newFilePath, html.replace(/(?<!\/)\.\.\//g, ''))
							);
						break;
					default:
						esbuild('menu.css', 'menu.js');
						HTML.renderMenu(Config.DIR_OUT, MENU_DATA);
						break;
				}
			}
		}
	});

esbuild({ bundle: false }, 'common.css', 'wishlist.css');
esbuild({ globalName: 'Wishlist' }, 'wishlist.js');

cloneDirStructure(Config.DIR_STATIC, Config.DIR_OUT);
