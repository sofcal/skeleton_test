'use strict';

const _ItemCollectionBase = require('./_ItemCollectionBase');

class ComponentItemCollection extends _ItemCollectionBase {
    constructor(name) {
        super();
        this.name = name;

        // this is just an ordering thing for the output. It puts the keys of this object in the order defined by postman,
        //  rather than JS's first created order. If this was code for the API rather than a helper tool, I'd do something
        //  more robust (e.g json-stable-stringify) but for our purposes, this is fine.
        delete this.item;
        this.item = [];
    }

    static CreateFromRaw(name) {
        return new ComponentItemCollection(name);
    }
}

module.exports = ComponentItemCollection;
