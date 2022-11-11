#!/usr/bin/env node

/*
 * Build script for the application.
 *
 * JS code is bundled by esbuild and injected into a
 * script tag of a minified HTML template, resulting
 * in a single HTML file that can be run anywhere.
 */

import { openSync, writeSync, close } from 'fs';
import { readdir, readFile, rm } from 'fs/promises';
import { dirname, extname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

import { minify } from 'html-minifier';
import { build } from 'esbuild';

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

const IN_HTML  = join(DIR_SRC, 'index.html');
const IN_JS    = join(DIR_SRC, 'app.js');
const IN_CSS   = join(DIR_SRC, 'style.css');

const OUT_HTML = join(DIR_OUT, 'index.html');
const OUT_CSS  = join(DIR_OUT, 'style.css');

/** @type {number} */
let writer;

/** @type {number} */
let callbacks = 0;
let neededCallbacks = 3;

/** @type {Array<Buffer>} */
const chunks = [
	null,					// HTML
	Buffer.from(CONFIG.title ?? "Wishlist"),
	null,					// HTML
	null,					// Injected CSS
	null,					// HTML
	null,					// Injected JS objects
	null,					// Injected JS code
	null					// HTML
];

function readyCallback()
{
	if (++callbacks == neededCallbacks)
	{
		let position = 0;

		function writeBuffer(buffer) {
			writeSync(writer, buffer, 0, buffer.length, position);
			position += buffer.length;
		}

		for (const buffer of chunks) {
			if (buffer == null) continue;
			if (buffer instanceof Buffer) writeBuffer(buffer);
			else if (buffer instanceof Array) for (const b of buffer) writeBuffer(b);
			else throw "I can't write non-buffers!";
		}

		close(writer);
	}
}

// Read and process files asynchronously
// trying to make things efficient
// starting with more intensive tasks

// Build the JS with esbuild
build({
	entryPoints: [IN_JS],
	outfile: OUT_HTML,
	bundle: true,
	minify: true
})
.then(() => readFile(OUT_HTML))
.then(buffer => {
	chunks[6] = buffer.subarray(0, buffer.length - 2);
	return openSync(OUT_HTML, 'w+');
})
.then(w => {
	writer = w;
	readyCallback();
});

// Build the CSS with esbuild
build({
	entryPoints: [IN_CSS],
	outfile: OUT_CSS,
	bundle: true,
	minify: true
})
.then(() => readFile(OUT_CSS))
.then(buffer => {
	rm(OUT_CSS);
	chunks[3] = buffer;
	readyCallback();
});

// Read and optionally encrypt data files
readdir(DIR_DATA, { withFileTypes: true })
	.then(directory => {
		let allData = [];
		for (const dirent of directory) {
			if (dirent.isFile()) switch (extname(dirent.name)) {
				case '.json':
					// TODO: offer to encrypt
				case '.aes':
					++neededCallbacks;
					readFile(join(DIR_DATA, dirent.name), 'utf8')
						.then(data => {
							allData.push(data);
							chunks[5] = Buffer.from(`const LISTS=${JSON.stringify(allData)};`);
							readyCallback();
						});
			}
			else console.log(`Ignoring ${dirent.name}: is not a file.`);
		}
	})
	.catch(err => console.log("No wishlists found!"));

// Read, minify and split the HTML template
readFile(IN_HTML, 'utf8').then(html => {

	html = minify(html, {
		collapseBooleanAttributes: true,
		collapseWhitespace: true,
		removeAttributeQuotes: true,
		removeEmptyAttributes: true,
		removeOptionalTags: true,
		removeRedundantAttributes: true
	}).split("{}");

	chunks[0] = Buffer.from(html[0]);
	chunks[2] = Buffer.from(html[1]);
	chunks[4] = Buffer.from(html[2]);
	chunks[7] = Buffer.from(html[3]);

	readyCallback();
});

// Read config file if it exists
// readFile('wishlist-config.json')
// 	.then(config => {
// 		config = JSON.parse(config);
// 		if (typeof config.title === "string")
// 			chunks[1] = Buffer.from(config.title);
// 	})
// 	.catch(err => console.log("No wishlist-config.json found. Using default values."))
// 	.finally(readyCallback);
