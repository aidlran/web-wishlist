#!/usr/bin/env node

import { cp, readdir } from 'fs/promises';
import { join } from 'path';

import { DIR_DEFAULT } from './service/config.mjs';

readdir(DIR_DEFAULT).then(directory => {
	for (const name of directory)
		cp(join(DIR_DEFAULT, name), join('./', name), {recursive: true});
});
