import promptUnlock from './unlocker';

function renderHeading(wishlist) {
	document.body
		.appendChild(document.createElement('header'))
		.appendChild(document.createElement('h1'))
			.innerText = wishlist.name ?? "Wishlist";
}

export async function render(wishlist) {

	renderHeading(wishlist);

	if (wishlist.cipherText)
		promptUnlock(wishlist)
			.then(renderWishlist);
	else
		renderWishlist(wishlist);
}

function renderWishlist(wishlist) {

	if (wishlist.items instanceof Array) {

		const wishlistContainer = document.body
			.appendChild(document.createElement('main'))
			.appendChild(document.createElement('div'));
		wishlistContainer.classList.add('wishlist-container');

		for (let wishlistItem of wishlist.items)
			renderWishlistItem(wishlistContainer, wishlistItem);
	}
}

function renderWishlistItem(container, item) {

	switch (typeof item) {
		case 'string': item = { name: item };
		case 'object': break;
		default: return;
	}

	const wishlistItemContainer = container.appendChild(document.createElement('div'));
	wishlistItemContainer.classList.add('wishlist-item');

	// Item name/title
	wishlistItemContainer.appendChild(document.createElement('h2'))
		.innerText = item.name;

	if (item.description) {
		const descriptionText = wishlistItemContainer.appendChild(document.createElement('p'));
		descriptionText.innerText = item.description;
		descriptionText.classList.add('wishlist-item-description');
	}

	const data = wishlistItemContainer.appendChild(document.createElement('p'));
	data.classList.add('wishlist-item-data');

	if (item.price) data.appendChild(document.createElement('span'))
		.innerText = item.price;

	// Item hyperlink
	if (item.link) {
		const linkButton = data.appendChild(document.createElement('a'));
		linkButton.innerText = "Link";
		linkButton.href = item.link;
		linkButton.target = '_blank';
		linkButton.rel = 'noopener noreferrer';
		const linkGlyph = linkButton.appendChild(document.createElement('span'));
		linkGlyph.classList.add('glyphicon', 'link');
	}
}

export default render;
