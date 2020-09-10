'use strict';

const validators = require('./validators');

const { LambdaApiBase } = require('@sage/bc-module-lambda-api-base');
// const { HateoasResponse } = require('@sage/bc-contracts-api-hateoas');

const util = require('util');

const _ = require('underscore');
const needle = require('needle');
const Promise = require('bluebird');
const uuid = require('uuid');

// These are test credentials and are active only for specific environments. Real credentials will be supplied securely
//  to providers for sandbox and production. A given apiKey and cloudId will only allow access to your Provider data.
const auth = {
    // rate limited and throttling at the Gateway level. If this is incorrect, you'll likely see a 403 Forbidden error.
    apiKey: 'vawDicFfKDNbPIZ5btS6ByWv8E1eES6IrQ3nZtj0',
    // Authentication is provided by CloudId which supplies JWT Bearer tokens. Your client_id and client_secret identify
    //  you as a Provider. If these are lost or compromised please contact us immediately. These sample credentials are
    //  are only valid on certain environments and will only grant access to our sample Provider data.
    cloudId: {
        token: null,
        url: 'https://id-shadow.sage.com/oauth/token',
        request: Object.freeze({
            grant_type: 'client_credentials',
            client_id: 'G8Pj9wTShYONLGbUZ8u5kavHUJVjdw9M',
            client_secret: 'zRtX0Pm7ZTXptA-4AfZytuZCWS7TRXn6u-gTtizjjPOz4jzqLoO06ZsvInB75AVa',
            audience: 'bankingclouddev/sfdsBankingProvider'
        })
    }
};

const product = require('../../../package.json').short;

class ApiCallbackPostLambda extends LambdaApiBase {
    constructor({ config }) {
        const serviceId = '@sage/lambda.api.temp.post';
        super({ config, serviceId, product, validators, params: [], requiredDatabases: [] });

        // const { Environment, AWS_REGION: Region } = config;
        // we're looking to add this url to the inbound data on the Auth endpoint, but for now it's hardcoded. Real providers
        //  will received a fixed version of this URL for sandbox and production. We auto-generate parts of it here as our
        //  demo works across multiple test environments.
        this.authorizationsUrl = 'https://papi-dev02-eu-west-1.sagebanking-dev.cloud/v1/authorisations';
    }

    static Create(...args) {
        return new ApiCallbackPostLambda(...args);
    }

    /**
     * Main function. This is where all your business logic should go. Any value returned from this function will be passed
     *  to the buildResponse function
     * @param event
     */
    async impl(event) { // eslint-disable-line class-methods-use-this
        const func = `${ApiCallbackPostLambda.name}.impl`;
        event.logger.info({ function: func, log: 'started' });

        const { state } = parseFormData(event.body);

        // this is just a sample endpoint to demonstrate redirecting the UI back to the Banking Cloud API. This would happen
        // after a completed sign-in to the Bank and consents granted.

        // call the /authorisations endpoint to notify Banking Cloud of the customer's available bank accounts.
        await patchAuthorizations(this.authorizationsUrl, state);

        // If we're finished, redirect back to Banking Cloud using the URI provided in the original /auth request
        return {
            statusCode: 200,
            headers: { }
        };
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
        const func = `${ApiCallbackPostLambda.name}.buildResponse`;
        logger.info({ function: func, log: 'building success response', params: { statusCode } });
        return [null, { statusCode, body: JSON.stringify(hateoasResponse), headers: LambdaApiBase.headers }];
    }
}

// our 'auth' form posts data back as url-form-encoded, so we need to manually split it. This is not a robust implementation,
//  however it suits our basic needs.
const parseFormData = (data) => {
    const pairs = data.split('&');

    return _.reduce(pairs, (memo, pair) => {
        const [key, value] = pair.split('=');
        memo[key] = value;    // eslint-disable-line no-param-reassign
        return memo;
    }, {});
};

const patchAuthorizations = async(authorizationsUrl, authorizationId, isRetry = false) => {
    const authorizations = {
        status: 'success', // error, cancelled
        bankAccounts: [{
            // I'm randomising a few of these values so that we can replay this many times, but in a real system, they
            // should be fixed values. Refer to the swagger.
            bankAccountExternalId: uuid.v4(),
            accountName: 'Skeleton Account 1',
            accountIdentifier: uuid.v4().replace(/-/g, '').substring(0, 8),
            bankIdentifier: '000000001',
            branchIdentifier: 'demo_provider'
        }, {
            bankAccountExternalId: uuid.v4(),
            accountName: 'Skeleton Account 2',
            accountIdentifier: uuid.v4().replace(/-/g, '').substring(0, 8),
            bankIdentifier: '000000001',
            branchIdentifier: 'demo_provider'
        }]
    };

    // authenticate with CloudId - this will populate auth.cloudId.token
    await authenticate();

    // we're looking to add this url to the inbound data on the Auth endpoint, but for now it's fixed
    const endpoint = `${authorizationsUrl}/${authorizationId}`;

    // both the cloudId token and the apiKey are required.
    const options = {
        headers: { Authorization: auth.cloudId.token, 'x-api-key': auth.apiKey },
        json: true
    };

    console.log(`attempting to update authorization: ${endpoint}`);             // eslint-disable-line no-console
    const { statusCode, body } = await needle('patch', endpoint, { data: authorizations }, options);

    console.log(`retrieved response from PATCH authorisations: ${statusCode}`); // eslint-disable-line no-console
    console.log(util.inspect(body, false, null));                               // eslint-disable-line no-console

    // if a retryable error occurred, wait a few seconds and try again. In reality, this should use some form of incremental
    //  backoff.
    if (_.contains([401, 429, 500, 503, 408], statusCode) && !isRetry) {
        if (statusCode === 401) {
            // if the request failed due to an expired/invalid token we reset it before trying again, this will cause a refresh
            auth.cloudId.token = null;
        }

        await Promise.delay(3000);

        console.log('retrying');                                                // eslint-disable-line no-console
        return patchAuthorizations(authorizationId, true);
    }

    console.log('successfully patched authorisation');                          // eslint-disable-line no-console
    return { statusCode, body };
};

const authenticate = async() => {
    // cloudId tokens should be cached wherever possible. Too many requests for tokens will cause rate limiting. Each token
    //  lasts for ~480 minutes. Refresh should occur upon receiving a 401 form an endpoint.
    if (!auth.cloudId.token) {
        console.log(`refreshing cloudId token: ${auth.cloudId.url}`); // eslint-disable-line no-console
        const res = await needle('POST', auth.cloudId.url, auth.cloudId.request, { headers: 'application/x-www-form-urlencoded' });
        console.log(`retrieved response from cloudId: ${res.statusCode}`); // eslint-disable-line no-console

        // e.g. Bearer ...
        auth.cloudId.token = `${res.body.token_type} ${res.body.access_token}`;
    }

    return auth.cloudId.token;
};

// const getDBInterfaces = (services) => {
//     services.documentDB.addDatabaseInterface(Providers, 'providers');
//     services.documentDB.addDatabaseInterface(Batches, 'batches');
//
//     return services.documentDB.getDatabaseInterfaces();
// };

module.exports = ApiCallbackPostLambda;
