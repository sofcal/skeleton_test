'use strict';

const validators = require('./validators');
const handlers = require('./handlers');

const { DynamoLikeBase } = require('@sage/bc-servicelayer-db-dynamolikebase');
const { ConnectorsDB } = require('@sage/bc-servicelayer-db-plugins-connectorsdb');
const { LambdaApiBase } = require('@sage/bc-module-lambda-api-base');
// const { HateoasResponse } = require('@sage/bc-contracts-api-hateoas');

const product = require('../../../package.json').short;

class TempData {
    constructor(data) {
        this.PrimaryKey = data.PrimaryKey;
        this.Id = data.Id;
        this.CompositeKey = data.CompositeKey;
        this.NumAttribute = data.NumAttribute;
        this.BoolAttribute = data.BoolAttribute;
        this.ListAttribute = data.ListAttribute;
        this.MapAttribute = data.MapAttribute;
        this.NullAttribute = data.NullAttribute;
    }
    static Create(...args) { return new TempData(...args); }
    static Validate() { return true; }
}

class Temp extends DynamoLikeBase {
    constructor(connection) {
        super({ connection, name: 'Temp', Type: TempData });
    }

    static Create(...args) { return new Temp(...args); }
    generateKeysSync(item, id) { // eslint-disable-line class-methods-use-this
        return {
            PrimaryKey: Temp.name,
            Id: id || item.Id // ,
            // CompositeKey: 'composite_key'
        };
    }

    generateCompositesSync(/* item */) { // eslint-disable-line class-methods-use-this
        return { CompositeKey: 'composite_key' };
    }
}

class ApiAuthGetLambda extends LambdaApiBase {
    constructor({ config }) {
        const serviceId = '@sage/lambda.api.auth.get';
        super({ config, serviceId, validators, product, params: [], requiredDatabases: [ConnectorsDB] });
    }

    static Create(...args) {
        return new ApiAuthGetLambda(...args);
    }

    /**
     * Main function. This is where all your business logic should go. Any value returned from this function will be passed
     *  to the buildResponse function
     * @param event
     */
    async impl(event) { // eslint-disable-line class-methods-use-this
        const func = `${ApiAuthGetLambda.name}.impl`;
        event.logger.info({ function: func, log: 'started' });

        const interfaces = getDBInterfaces(this.services);
        await interfaces.temp.insertOne(TempData.Create({
            PrimaryKey: 'hashkey',
            Id: '00000000-0000-0000-0000-000000000000',
            CompositeKey: 'Composite',
            NumAttribute: 1,
            BoolAttribute: true,
            ListAttribute: [1, 'two', false],
            MapAttribute: { foo: 'bar' },
            NullAttribute: null
        }));
        // const found = await interfaces.temp.findOneById('00000000-0000-0000-0000-000000000000');
        await interfaces.temp.removeOne('00000000-0000-0000-0000-000000000000');
        // const { empty } = event.validated;

        console.log('event');
        console.log(event);
        const handler = (() => {
            if (event.path.indexOf('auth') !== -1) {
                return handlers.Auth.Create();
            } else if (event.path.indexOf('widget') !== -1) {
                return handlers.Widget.Create();
            }

            console.log(`unsupported endpoint: ${event.path}`);
            throw new Error('unsupported endpoint');
        })();

        return handler.run(event);
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
    async buildResponse({ statusCode, headers, body }, { logger }) { // eslint-disable-line class-methods-use-this
        const func = `${ApiAuthGetLambda.name}.buildResponse`;
        logger.info({ function: func, log: 'building success response', params: { statusCode } });
        return [null, { statusCode, body, headers }];
    }
}

const getDBInterfaces = (services) => {
    services.connectorsDB.addInterface(Temp, 'temp');

    return services.connectorsDB.getInterfaces();
};

module.exports = ApiAuthGetLambda;
