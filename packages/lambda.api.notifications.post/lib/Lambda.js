'use strict';

const validators = require('./validators');

const { LambdaApiBase } = require('@sage/bc-module-lambda-api-base');
const { HateoasResponse } = require('@sage/bc-contracts-api-hateoas');

const product = require('../../../package.json').short;

class ApiNotificationsPostLambda extends LambdaApiBase {
    constructor({ config }) {
        const serviceId = '@sage/lambda.api.temp.post';
        super({ config, serviceId, product, validators, params: [], requiredDatabases: [] });
    }

    static Create(...args) {
        return new ApiNotificationsPostLambda(...args);
    }

    /**
     * Main function. This is where all your business logic should go. Any value returned from this function will be passed
     *  to the buildResponse function
     * @param event
     */
    async impl(event) { // eslint-disable-line class-methods-use-this
        const func = `${ApiNotificationsPostLambda.name}.impl`;
        event.logger.info({ function: func, log: 'started' });

        // const interfaces = getDBInterfaces(this.services);
        // const { empty } = event.validated;

        const hateoasResponse = HateoasResponse.Create({ data: { value: 'ok' }, links: {}, meta: {} });

        event.logger.info({ function: func, log: 'ended' });

        // return appropriate result to be returned in buildResponse. Most of the time, this is to update the existing event
        return { statusCode: 200, hateoasResponse };
    }

    /**
     * Called when the function did not throw any errors. Generates a response array to send to AWS Lambda. The response requires two
     *  values;
     * - a lambda error value, which would cause the lambda to retry. This should almost always be null.
     * - a response to send to the invoker of the function. This can contain success or graceful failure values
     * @param { statusCode, hateoasResponse}: The response form the impl function
     * @param { logger }: contains a logger object
     * @returns {Bluebird<[retry, result]>}
     */
    async buildResponse({ statusCode, hateoasResponse }, { logger }) { // eslint-disable-line class-methods-use-this
        const func = `${ApiNotificationsPostLambda.name}.buildResponse`;
        logger.info({ function: func, log: 'building success response', params: { statusCode } });
        return [null, { statusCode, body: JSON.stringify(hateoasResponse), headers: LambdaApiBase.headers }];
    }
}

// const getDBInterfaces = (services) => {
//     services.documentDB.addDatabaseInterface(Providers, 'providers');
//     services.documentDB.addDatabaseInterface(Batches, 'batches');
//
//     return services.documentDB.getDatabaseInterfaces();
// };

module.exports = ApiNotificationsPostLambda;
