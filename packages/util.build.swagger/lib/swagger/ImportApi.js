'use strict';

const SwaggerBase = require('./SwaggerBase');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Connector: Banking Skeleton: API',
            version: '0.0.4',
            description: '<TBC>'
        },
        servers: [{
            url: 'https://bnkc-fnb.fabric.sage.com/provider/v1',
            description: 'Production environment. Live hamsters powering the machines, live data in the databases.'
        }, {
            url: 'https://bnkc-fnb.dev-fabric.sage.com/provider/v1',
            description: 'Development environment containing the latest and likely break-est changes. This environment ' +
            'should only be used for previewing functionality and should never be considered stable.'
        }]
    },
    // pre-build glob patterns for files that may contain swagger definitions. The must be relative to the
    //  this projects package.json
    apis: ['./lib/components/**/*.js', '../module*/src/**/*.js', '../lambda.api*/lib/**/*.js']
};

// order the paths so that our API lists POST endpoints first. This ordering is just cleanest for our implementation. If
//  we need to do any more complex ordering, we'll re-address
const endpointOrder = [

];

const tagOrder = [];

class ImportApi extends SwaggerBase {
    constructor() {
        super(options, endpointOrder, tagOrder, 'swagger.yaml');
    }

    static Create(...args) {
        return new ImportApi(...args);
    }
}

module.exports = ImportApi;
