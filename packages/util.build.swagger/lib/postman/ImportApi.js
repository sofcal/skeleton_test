'use strict';

const PostmanBase = require('./PostmanBase');
const templates = require('./templates/ImportApi');

// fixed value to create the same collection each time
const postmanId = '49c01660-fc5e-4776-a1fc-b24ed4a64361';

class ImportApi extends PostmanBase {
    constructor() {
        super('postman.json', postmanId, templates);
    }

    static Create(...args) {
        return new ImportApi(...args);
    }
}

module.exports = ImportApi;
