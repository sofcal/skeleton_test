'use strict';

const _ = require('underscore');

const consts = {
    AUTHORIZATION: 'Authorization',
    TOKEN: 'token',
    TEXT: 'text'
};

class Header {
    constructor(key, value, type) {
        this.key = key;
        this.value = value;
        this.type = type;
    }

    static CreateFromRawSecurities(swaggerHeader, swaggerSecurity) {
        const [key] = _.keys(swaggerHeader); // swaggerHeader is an object, with a single property defining the security method
        const security = swaggerSecurity[key];

        return new Header(security.name, `{{${key}}}`, consts.TEXT);
    }

    static CreateFromContentType(contentType) {
        return new Header('Content-Type', contentType);
    }
}

module.exports = Header;
