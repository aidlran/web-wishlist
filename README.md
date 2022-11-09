# Wishlist

The goal of this project is to make a small, serverless, single-page web app capable of displaying one or many wishlists. These wishlists are stored in JSON data files and may be encrypted symmetrically using a passphrase and can be unlocked client-side in the app. I intend to deploy this to a URL on my GitHub pages website.

## Roadmap

- [x] Build script.
- [x] Init script.
- [ ] Encrypt script.
- [ ] Decrypt script.
- [x] Set up a binary.
- [ ] Decryption in the browser.
- [ ] Write a GitHub workflow sample and deploy on my website.
- [ ] Frontend.
- [ ] Adapt the GUI for wishlist editing. (stretch)

## Usage

First, install to your project:

```sh
npm i git+https://github.com/aidlran/wishlist.git
```

### Commands

Generate defaults in your project:

```sh
web-wishlist init
```

Build the app and output to `dist/index.html`:

```sh
web-wishlist build
```

(TODO) Encrypt or decrypt a wishlist file:

```sh
web-wishlist encrypt <filename>
web-wishlist decrypt <filename>
```
