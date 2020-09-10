'use strict';

const _ItemCollectionBase = require('./_ItemCollectionBase');

class PostmanItemCollection extends _ItemCollectionBase {
    constructor(name, description, { id }) {
        super();

        this.info = {
            _postman_id: id, // hardcoded so it is the same whenever we regenerate
            name: `${name}`,
            description,
            schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
        };

        // this is just an ordering thing for the output. It puts the keys of this object in the order defined by postman,
        //  rather than JS's first created order. If this was code for the API rather than a helper tool, I'd do something
        //  more robust (e.g json-stable-stringify) but for our purposes, this is fine.
        delete this.item;
        this.item = [];
    }

    static CreateFromRaw(swaggerInfo = {}, { id }) {
        return new PostmanItemCollection(swaggerInfo.title, swaggerInfo.description, { id });
    }
}

module.exports = PostmanItemCollection;
