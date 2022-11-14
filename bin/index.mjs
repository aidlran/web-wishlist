#!/usr/bin/env node

import { readdir } from 'fs';
import { basename, dirname, extname } from 'path';
import { fileURLToPath } from 'url';

readdir(dirname(fileURLToPath(import.meta.url)), { withFileTypes: true }, (err, verbs) => {

	if (err) throw err;

	verbs = verbs
		.filter(file => file.isFile() && file.name !== 'index.mjs')
		.map(file => basename(file.name, extname(file.name)));

	if (process.argv.length < 3) {
		console.log("No verb provided.");
		console.log("Possible verbs:", verbs);
		process.exit(1);
	}

	if (verbs.find(verb => verb === process.argv[2]))
		import(`./${process.argv[2]}.mjs`);

	else {
		console.log(`Unrecognised verb: ${process.argv[2]}`);
		process.exit(1);
	}
});
