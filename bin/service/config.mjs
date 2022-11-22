import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

import readJSON from './readJSON.mjs';

export const DIR_MODULE_ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../');
export const DIR_DEFAULT = join(DIR_MODULE_ROOT, 'default/');
export const DIR_LAYOUTS = join(DIR_MODULE_ROOT, 'layouts/');
export const DIR_SRC = join(DIR_MODULE_ROOT, 'src/');
export const DIR_STATIC = join(DIR_MODULE_ROOT, 'static/');

const CONFIG = Object.assign(
	await readJSON(join(DIR_DEFAULT, 'wishlist-config.json')),
	await readJSON('wishlist-config.json') ?? (() => {
		console.log("Using default values.");
		return {};
	})()
);

export const DIR_WISHLISTS = resolve(CONFIG.wishlists);
export const DIR_OUT = resolve(CONFIG.out);

export const TITLE = CONFIG.title;

export default {
	DIR_DEFAULT,
	DIR_LAYOUTS,
	DIR_MODULE_ROOT,
	DIR_OUT,
	DIR_SRC,
	DIR_STATIC,
	DIR_WISHLISTS,
	TITLE
};
