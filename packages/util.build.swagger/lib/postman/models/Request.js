'use strict';

const Url = require('./Url');
const Header = require('./Header');

const _ = require('underscore');
const _s = require('underscore.string');
const access = require('safe-access');

class Request {
    constructor(auth, method, headers, body, url, description) {
        this.auth = auth;
        this.method = method;
        this.header = headers;
        this.body = body;
        this.url = url;
        this.description = description;
    }

    static CreateFromRaw(swaggerPath, swaggerMethod, swaggerItem, swaggerComponents = {}, templates) {
        const postmanMethod = swaggerMethod.toUpperCase();

        const { security, description } = swaggerItem;
        const auth = { type: 'noauth' };
        const headers = _.chain(security)
            .sortBy((s) => s.name)
            .map((s) => Header.CreateFromRawSecurities(s, swaggerComponents.securities))
            .value()
            .reverse();

        const contentObject = access(swaggerItem, 'requestBody.content');
        if (contentObject) {
            const [contentType] = _.keys(contentObject);
            headers.push(Header.CreateFromContentType(contentType));
        }

        const url = Url.CreateFromRaw(swaggerPath, swaggerComponents.parameters);

        const splits = _s.words(swaggerItem.summary, ' ');
        const body = access(templates, `${splits[0]}.${splits[1]}.body`);

        return new Request(auth, postmanMethod, headers, body, url, description);
    }
}

module.exports = Request;
