'use strict';

const _ = require('underscore');

/** validate any additional event properties required by this lambda. Values required by the base class are validated there */
module.exports = (event) => {
    const { stage } = event;

    if (stage !== 'end' && stage !== 'start' && stage !== 'error') {
        throw new Error(`invalid stage value: ${stage}`);
    }

    _.extend(event.validated, { stage });
};
