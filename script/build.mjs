#!/usr/bin/env node

/*
 * Build script for the application.
 *
 * JS code is bundled by esbuild and injected into a
 * script tag of a minified HTML template, resulting
 * in a single HTML file that can be run anywhere.
 */

import { openSync, writeSync, close } from 'fs';
import { readFile, rm } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import { minify } from 'html-minifier';
import { build } from 'esbuild';

const DIR_ROOT = join(dirname(fileURLToPath(import.meta.url)), '../');
const DIR_SRC  = join(DIR_ROOT, 'src/');
const DIR_OUT  = join(DIR_ROOT, 'dist/');

const IN_HTML  = join(DIR_SRC, 'index.html');
const IN_JS    = join(DIR_SRC, 'app.js');
const IN_CSS   = join(DIR_SRC, 'style.css');

const OUT_HTML = join(DIR_OUT, 'index.html');
const OUT_CSS  = join(DIR_OUT, 'style.css');

/** @type {number} */
let writer;

/** @type {number} */
let callbacks = 0;

/** @type {Array<Buffer>} */
const chunks = [
	null,					// HTML
	Buffer.from("Wishlist"),// Title
	null,					// HTML
	null,					// Injected CSS
	null,					// HTML
	null,					// Injected JS
	null					// HTML
];

function readyCallback() {
	if (++callbacks == 4) {
		let position = 0;
		for (const buffer of chunks) {
			writeSync(writer, buffer, 0, buffer.length, position);
			position += buffer.length;
		}
		close(writer);
	}
}

readFile('wishlist-config.json')
	.then(config => {
		config = JSON.parse(config);
		if (typeof config.title === "string")
			chunks[1] = Buffer.from(config.title);
	})
	.catch(error => {
		console.log(error);
		// No valid config file; use defaults
	})
	.then(() => readyCallback());

// Read, minify and split the HTML template
readFile(IN_HTML, 'utf8')
	.then(html => {
		minify(html, {
			collapseBooleanAttributes: true,
			collapseWhitespace: true,
			removeAttributeQuotes: true,
			removeEmptyAttributes: true,
			removeOptionalTags: true,
			removeRedundantAttributes: true
		}).split("{}").forEach((chunk, index) =>
			chunks[index * 2] = Buffer.from(chunk));
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

// Build the JS with esbuild
build({
		entryPoints: [IN_JS],
		outfile: OUT_HTML,
		bundle: true,
		minify: true
	})
	.then(() => readFile(OUT_HTML))
	.then(buffer => {
		chunks[5] = buffer.subarray(0, buffer.length - 2);
		return openSync(OUT_HTML, 'w+');
	})
	.then(w => {
		writer = w;
		readyCallback();
	});
