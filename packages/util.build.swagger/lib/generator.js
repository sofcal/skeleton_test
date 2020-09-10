'use strict';

const swagger = require('./swagger');
const postman = require('./postman');

const _ = require('underscore');

_.each(_.keys(swagger), (key) => {
    const swaggerGen = swagger[key].Create();
    const built = swaggerGen.build();

    if (postman[key]) {
        const postmanGen = postman[key].Create();
        postmanGen.build(built);
    }
});
