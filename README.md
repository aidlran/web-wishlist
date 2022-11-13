# Wishlist

The goal of this project is to make a small, serverless, single-page web app capable of displaying one or many wishlists. These wishlists are stored in JSON data files and may be encrypted symmetrically using a passphrase which can be unlocked client-side in the app.

## Roadmap

### v1.0.0

- [x] Build script.
- [x] Init script.
- [x] Set up a binary.
- [x] Write a GitHub workflow sample and deploy on my website.
- [ ] Encrypt script.
- [ ] Decrypt script.
- [ ] Decryption in the browser.
- [ ] Menu view.
- [ ] Wishlist view.

### Future

- [ ] Test suite.
- [ ] Adapt the GUI for editing wishlists.

## Usage

First, install to your project:

```sh
npm i github:aidlran/web-wishlist#1.x
```

### Commands

Generate default files in your project (see the [`default`](https://github.com/aidlran/web-wishlist/tree/1.x/default) directory):

```sh
web-wishlist init
```

Build the app and output to `dist/` by default:

```sh
web-wishlist build
```

(TODO) Encrypt or decrypt a wishlist file:

```sh
web-wishlist encrypt <filename>
web-wishlist decrypt <filename>
```

### Implementing it on GitHub Pages

For an example of it in action see my [website](https://aidlran.github.io/wishlist/) and its [source code](https://github.com/aidlran/aidlran.github.io).

Pay particular attention to:

- [`.github/workflows/jekyll.yml`](https://github.com/aidlran/aidlran.github.io/blob/main/.github/workflows/jekyll.yml): Pages must be built & deployed from a workflow since we're using additional technologies. Note that Node configuration comes after building the website with Jekyll.
- [`_config.yml`](https://github.com/aidlran/aidlran.github.io/blob/main/_config.yml): Jekyll is told to exclude certain files, like `package.json`, `wishlist-config.json` etc.
- [`package.json`](https://github.com/aidlran/aidlran.github.io/blob/main/package.json): `web-wishlist` is added as a dependency from GitHub, and a specific branch is targeted to avoid any breaking changes. The `scripts.build` field is also defined.
- [`wishlist-config.json`](https://github.com/aidlran/aidlran.github.io/blob/main/wishlist-config.json): Configure the `out` to the same place that Jekyll (or whichever framework you use) outputs its files.
