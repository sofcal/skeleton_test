'use strict';

const Request = require('./Request');

const access = require('safe-access');
const _s = require('underscore.string');

class MethodItem {
    constructor(name, event, request, response) {
        this.name = name;
        this.event = event;
        this.request = request;
        this.response = response;
    }

    static CreateFromRaw(swaggerPath, swaggerMethod, swaggerItem, swaggerComponents, templates) {
        const name = swaggerItem.summary;

        const splits = _s.words(name, ' ');
        const event = access(templates, `${splits[0]}.${splits[1]}.events`);

        const request = Request.CreateFromRaw(swaggerPath, swaggerMethod, swaggerItem, swaggerComponents, templates);

        return new MethodItem(name, event, request, []);
    }
}

module.exports = MethodItem;
