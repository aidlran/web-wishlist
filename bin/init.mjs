#!/usr/bin/env node

import { cp, readdir } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const DEFAULT_DIR = join(dirname(fileURLToPath(import.meta.url)), '../default');

readdir(DEFAULT_DIR).then(directory => {
	for (const name of directory)
		cp(join(DEFAULT_DIR, name), join('./', name), {recursive: true});
});
