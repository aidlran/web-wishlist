#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
import { createInterface } from 'readline';

import Config from './service/config.mjs';
import { decrypt, encrypt } from '../src/crypto.mjs';

function printUsageAndExit(error) {
	console.log(error, "Usage:");
	console.log("\tencrypt <file>");
	console.log("\tdecrypt <file>");
	process.exit(1);
}

// Ensure all args are present
switch (process.argv.length) {
	case 0:
	case 1:
	case 2:
		printUsageAndExit("No verb provided.");
	case 3:
		printUsageAndExit("No file name provided.");
}

/**
 * @type {boolean} TRUE if encrypt mode; FALSE if decrypt mode.
 */
const cryptMode = (() => {
	switch (process.argv[2]) {
		case 'decrypt':
			return false;
		case 'encrypt':
			return true;
		default:
			printUsageAndExit(`Unrecognised verb: ${process.argv[2]}`);
	}
})();

const filesToTry = [ resolve(process.argv[3]) ];
if (!process.argv[3].endsWith('.json'))
	filesToTry.push(resolve(`${process.argv[3]}.json`));
filesToTry.push(join(Config.DIR_WISHLISTS, process.argv[3]));
if (!process.argv[3].endsWith('.json'))
	filesToTry.push(join(Config.DIR_WISHLISTS, `${process.argv[3]}.json`));

if (!filesToTry.find(filePath => {

	// Try to read and parse
	let file = read(filePath);
	if (!file) return false;
	file = parse(file); // Will exit process if fails

	// Exit if trying to encrypt an already encrypted file etc.
	if (cryptMode == !!file.cipherText) {
		console.log(`File is already ${cryptMode ? 'en' : 'de'}crypted: ${filePath}`);
		process.exit(0);
	}

	const UIO = createInterface(process.stdin, process.stdout);

	UIO._writeToOutput = function _writeToOutput(stringToWrite) {
		// Intercept console output while typing passphrase
		// TODO: needs improving - backspacing and stuff is awkward
		if (stringToWrite.startsWith("Passphrase:"))
			UIO.output.write(stringToWrite);
	};

	UIO.question("Passphrase: ", passphrase => {
		console.log(); // Print newline
		UIO.close();
		const crypted = (cryptMode ? encrypt : decrypt)(file, passphrase);
		if (!crypted) process.exit(1);
		writeFileSync(filePath, JSON.stringify(crypted, null, 2));
		console.log(`Successfully ${cryptMode ? 'en' : 'de'}crypted: ${filePath}`);
	});

	return true;
})) {
	// If no file paths work:
	console.log(`Could not find your file: '${process.argv[3]}'`);
	process.exit(1);
}

function read(filePath) {
	try {
		return readFileSync(filePath, 'utf8');
	} catch (e) {
		return null;
	}
}

function parse(string) {
	try {
		return JSON.parse(string);
	} catch (e) {
		console.warn("Couldn't parse wishlist JSON.");
		process.exit(1);
	}
}
