document.head.appendChild((script => {
    script.addEventListener('load', () =>
        Wishlist({wishlistData})
    );
    script.src = '../wishlist.js';
    return script;
})(document.createElement('script')));
