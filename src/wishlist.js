import { Unlocker } from './unlocker';

const MAIN = document.getElementsByTagName('main')[0];

export async function render(wishlist) {

	// Heading
	MAIN.appendChild(document.createElement('h1'))
		.innerText = wishlist.name ?? "Wishlist";

	if (wishlist.cipherText)
		Unlocker(wishlist)
			.then(renderWishlist);
	else
		renderWishlist(wishlist);
}

function renderWishlist(wishlist) {

	if (wishlist.items instanceof Array)
		for (const ITEM of wishlist.items)
			if (ITEM.name)
				MAIN.appendChild(document.createElement('h2'))
					.innerText = ITEM.name;
}

export default render;
