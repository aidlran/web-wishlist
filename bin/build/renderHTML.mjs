import { readFile, writeFile } from 'fs/promises';
import { dirname, join} from 'path';
import { fileURLToPath } from 'url';

import { minify } from 'html-minifier';

const MINIFY_CONFIG = {
    collapseBooleanAttributes: true,
    collapseWhitespace: true,
    removeAttributeQuotes: true,
    removeEmptyAttributes: true,
    removeOptionalTags: true,
    removeRedundantAttributes: true
};

let template;
let templateReady = false;
let templateReadyCallbacks = [];

readFile(join(dirname(fileURLToPath(import.meta.url)), '../../src/template.html'), 'utf8')
    .then(readTemplate => {
        template = readTemplate
        templateReady = true;
        for (const callback of templateReadyCallbacks)
            callback(template);
        templateReadyCallbacks = undefined;
    });

function onTemplateReady(fn) {
    if (templateReady) fn(template);
    else templateReadyCallbacks.push(fn);
}

function replaceVariable(template, replacee, ...replacement) {
    const chunks = template.split(`{${replacee}}`);
    let output = chunks[0];
    for (const string of replacement)
        output += string;
    return output += chunks[1];
}

/**
 * @param {string} tag 
 * @param {string} body 
 * @param {Object?} [attributes]
 * @returns 
 */
function makeTag(tag, body, attributes) {
    if (attributes) {
        let out = `<${tag}`;
        for (const attribute of Object.getOwnPropertyNames(attributes)) {
            out += ` ${attribute}="${attributes[attribute]}"`;
        }
        return out += `>${body}</${tag}>`;
    }
    else return `<${tag}>${body}</${tag}>`;
}

function makeScriptLinkTag(src) {
    return makeTag('script', "", {src: `${src}.js`});
}

function makeScriptTag(...body) {
    let outBody = "";
    for (const string of body)
        outBody += string;
    return makeTag('script', outBody);
}

function makeStyleLinkTag(href) {
    return makeTag('link', "", {
        rel: 'stylesheet',
        href: `${href}.css`
    });
}

export function renderMenu(outDir, wishlists) {
    onTemplateReady(() => {
        let output = replaceVariable(template, 'title', "Wishlists");
        output = replaceVariable(output, 'head', makeScriptLinkTag('menu'));
        output = replaceVariable(output, 'body', (() => {
            let wishlistsString = "";
            for (const wishlist of wishlists)
                wishlistsString += `<a href="${wishlist.slug}/">${wishlist.name}</a>`;
            return wishlistsString;
        })());
        writeFile(join(outDir, 'index.html'), minify(output, MINIFY_CONFIG));
    });
}

export function renderPage(outFile, wishlist) {
    onTemplateReady(() => {
        let output = replaceVariable(template, 'title', wishlist.name ?? "Wishlist");
        output = replaceVariable(output, 'head',
            makeScriptLinkTag('wishlist'),
            makeStyleLinkTag('common')
        );
        output = replaceVariable(output, 'body', "");
        writeFile(outFile, minify(output, MINIFY_CONFIG));
    });
}
