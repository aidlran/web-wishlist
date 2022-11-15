import { AES, enc, format } from 'crypto-js';

/**
 * Decrypts a wishlist object.
 * @param {{cipherText?: string}} wishlist A wishlist object with a cipherText field.
 * @param {string} passphrase The passphrase used when encrypting the wishlist.
 * @returns {null|false|Object} If wishlist contains no cipherText, returns NULL.
 * If decryption failed, returns FALSE. If successful, returns the wishlist object
 * with cipherText field removed and decrypted fields added.
 */
export function decrypt(wishlist, passphrase) {

	if (!wishlist.cipherText) return null;

    const outputWishlist = { ...wishlist };

    try {

		const decrypt = AES.decrypt(outputWishlist.cipherText, passphrase).toString(enc.Utf8);
		delete outputWishlist.cipherText;

		if (!decrypt) throw "";

		try {
			Object.assign(outputWishlist, JSON.parse(decrypt));
		} catch (e) {
			console.error("Invalid or corrupt cipher text!");
			return false;
		}

	} catch (e) {
		console.error("Incorrect passphrase!");
		return false;
	}

	return outputWishlist;
}

/**
 * Encrypts a wishlist object.
 * @param {Object} wishlist An wishlist object without a cipherText field.
 * @param {string} passphrase A passphrase that can later decrypt encrypt the wishlist.
 * @returns {null|{name?: string, cipherText: string}}
 * If an encrypted wishlist is passed, returns NULL.
 * Otherwise returns a wishlist with most fields
 * encrypted and encoded into the cipherText field.
 */
export function encrypt(wishlist, passphrase) {

	if (wishlist.cipherText) return null;

	const cipherFields = { ...wishlist };

	const name = cipherFields.name;
	delete cipherFields.name;

	return {
		name,
		cipherText: AES.encrypt(JSON.stringify(cipherFields), passphrase).toString(format.OpenSSL)
	};
}

export default {
	decrypt,
	encrypt
};
