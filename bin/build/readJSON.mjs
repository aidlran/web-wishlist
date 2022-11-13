import { readFile } from 'fs/promises';

function errorMessage(verb, path, error) {
    console.warn(`Couldn't ${verb} ${path}. (Reason: ${error.message})`);
}

export async function readJSON(path, options) {

    return readFile(path, options ?? 'utf8')
        .then(content => {
            try {
                return JSON.parse(content);
            } catch (error) {
                errorMessage("parse", path, error);
                return null;
            }
        })
        .catch(error => {
            errorMessage("read", path, error);
            return null;
        });
}

export default readJSON;
