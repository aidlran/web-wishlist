# [Web-Wishlist](https://github.com/aidlran/web-wishlist)

## Table of Contents

- [About](#about)
- [Usage](#usage)
- [Commands](#commands)
  - [Init](#init)
  - [Build](#build)
  - [Encrypt & Decrypt](#encrypt--decrypt)
- [wishlist-config.json](#wishlist-configjson)
- [Editing Wishlists](#editing-wishlists)
- [Roadmap](#roadmap)

## About

Generates a small serverless web app from one or more wishlists defined using JSON files. Designed to be used alongside a static site generator, and specifically for my own GitHub Pages site.

Wishlists can optionally be protected using AES-256 encryption (currently via [crypto-js](https://github.com/brix/crypto-js)) in which case they can be decrypted and rendered in the browser only if the viewer can supply the correct passphrase. This way they can be checked into a public repository while maintaining privacy!

## Usage

First, install to your project using [NPM](https://nodejs.org/en/download/):

```sh
npm i github:aidlran/web-wishlist#1.x
```

Then run the following to initialise web-wishlist in your project:

```sh
npm exec web-wishlist init
```

Open the newly generated `wishlist-config.json` and configure the `wishlists` and `out` properties to play nice with your static site generator. For instance, since I'm using Jekyll, I set mine to the following:

```json
"wishlists": "./_wishlists/",
"out": "./wishlist/"
```

Explanation:

- **`wishlists`** -  I'm storing my wishlists in `_wishlists/`, to follow Jekyll's directory naming scheme.
- **`out`** - The app is built to `wishlist/`, which should be copied when Jekyll builds, making it available at [aidlran.github.io/wishlist/](https://aidlran.github.io/wishlist/).
  - If you're using Hugo, use `./static/wishlist/` instead.

Ensure that your static site generator isn't including `package.json`, `package-lock.json`, or `wishlist-config.json` when it builds.

You might like to add the out directory to your `.gitignore`.

Finally, write or modify your GitHub Workflow for deploying your site to GitHub pages.  
For an example, [see mine](https://github.com/aidlran/aidlran.github.io/blob/main/.github/workflows/jekyll.yml).

## Commands

> **Note**  
> Since `web-wishlist` may not be on your PATH, you can execute these commands via [NPM scripts](https://docs.npmjs.com/cli/using-npm/scripts).
> See [this `package.json`](https://github.com/aidlran/aidlran.github.io/blob/main/package.json#L9-L13) for reference.  
> Alternatively, use `npm exec <command>` to force the NPM context for a single command.

### Init

```sh
web-wishlist init
```

Use this to generate default files in your project. It's not very smart - it essentially just blindly copies over what's in this module's [`default/`](https://github.com/aidlran/web-wishlist/tree/1.x/default) directory - so be careful. You can always create the files yourself.

It should create a `wishlists/` directory and a `wishlist-config.json` for you.

### Build

```sh
web-wishlist build
```

Use this to build the web app files to the `out` directory, which is `dist/` by default, but [can be specified](#wishlist-configjson) in your `wishlist-config.json`.

### Encrypt & Decrypt

> **Warning**  
> If you want your wishlist to be encrypted, be sure to encrypt it **before** committing it to the repo **and** deploying your project!

```sh
web-wishlist encrypt <file>
web-wishlist decrypt <file>
```

Encrypt or decrypt the file specified. It will ask for a passphrase interactively to ensure security.

A file must be specified. It will check the current working directory, then your wishlists directory, which is `wishlists/` by default, but [can be specified](#wishlist-configjson) in your `wishlist-config.json`. If it is unsuccessful, it will also try with `.json` appended to the filename.

So, say you had the file `./wishlists/wishlist.json`, the following would all be valid commands:

```sh
web-wishlist encrypt wishlist
web-wishlist encrypt wishlist.json
web-wishlist encrypt ./wishlists/wishlist.json
```

## wishlist-config.json

A JSON file located in the root of your project containing an object with properties, allowing you to override default values.

It does not have to be present, although if it isn't then the program will warn you it doesn't exist whenever it tries to find it. In this case it would just use the defaults.

| Property    | Default        | Description                  |
| ----------- | -------------- | ---------------------------- |
| `out`       | `./dist/`      | The output directory.        |
| `title`     | Wishlist       | Shown in page/tab title.     |
| `wishlists` | `./wishlists/` | The wishlist data directory. |

## Editing Wishlists

There is no interface for editing wishlists yet. You'll have to edit the JSON file manually.

The following describes the various properties of wishlist JSON files.

### `name`

A string representing the name of the list.

### `cipherText`

A string containing encrypted data.

> **Warning**  
> Do not modify the `cipherText` field or you'll corrupt your data.  
> Decrypt the file to edit it and then re-encrypt after editing.

### `items`

An array of objects representing each item in the list.  
Properties of item objects follow, and all are optional.

#### `item.name`

A string representing the name of the item

#### `item.description`

A string containing a longer description of the item.

#### `item.price`

A string representing the price of the item.

#### `item.link`

A string with a link to find the item online.

## Roadmap

### v1.0.0

- [x] Build script.
- [x] Init script.
- [x] Set up a binary.
- [x] Write a GitHub workflow sample and deploy on my website.
- [x] Decryption in the browser.
- [x] Encrypt and decrypt via binary.
- [x] Menu view.
- [x] Wishlist view.
- [ ] JSON schemas.

### Wishlist View

- [x] Hyperlinks.
- [ ] Images.
- [ ] Quantity.
- [ ] Custom key pair values.
- [ ] Candidates.
- [ ] Previously owned model (for upgrades).
- [ ] Categories.
- [ ] Sorting and filtering.

### CLI Improvements

- [ ] Encrypt/decrypt allows multiple filename arguments.
- [ ] Option for build that offers to encrypt files.
- [ ] Init can generate a relevant default config for different static site generators.

### Future

- [ ] Test suite.
- [ ] Adapt the GUI for editing wishlists.
- [ ] Functionality on my website similar to [link-lock](https://jstrieb.github.io/link-lock/).
- [ ] Dynamic pricing with APIs or web scraping.
- [ ] Localisation.
  - [ ] Currency conversion.
- [ ] IDE extension(s) to auto-map JSON schemas.
- [ ] Potentially migrate binaries to a faster language.
- [ ] YAML support.
- [ ] Native NodeJS `crypto` and browser `WebCrypto` implementations.
