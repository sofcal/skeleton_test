'use strict';

const _ = require('underscore');

class _ItemCollectionBase {
    constructor() {
        if (new.target === _ItemCollectionBase) {
            throw new TypeError('Cannot create instance of _ItemCollectionBase: use a concrete implementation');
        }

        this.item = [];
    }

    add(item) {
        this.item.push(item);
    }

    findItem(name) {
        return _.find(this.item, (i) => i.name === name);
    }
}

module.exports = _ItemCollectionBase;
