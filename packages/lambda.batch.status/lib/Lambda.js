'use strict';

const validators = require('./validators');

const { LambdaStepBase } = require('@sage/bc-module-lambda-step-base');
// const { HateoasResponse } = require('@sage/bc-contracts-api-hateoas');

const product = require('../../../package.json').short;

class BatchStatusLambda extends LambdaStepBase {
    constructor({ config }) {
        const serviceId = '@sage/lambda.batch.status';
        const requiredDatabases = [];
        super({ config, serviceId, product, validators, params: [], requiredDatabases });
    }

    static Create(...args) {
        return new BatchStatusLambda(...args);
    }

    /**
     * Main function. This is where all your business logic should go. Any value returned from this function will be passed
     *  to the buildResponse function
     * @param event
     */
    async impl(event) {
        const func = `${BatchStatusLambda.name}.impl`;
        event.logger.info({ function: func, log: 'started' });

        const { state } = event.validated;
        // const interfaces = getDBInterfaces(this.services);

        event.logger.info({ function: func, log: 'generating task' });
        await this.retrieveOrGenerateTask(state);

        event.logger.info({ function: func, log: 'ended' });
        return state.endCurrentTask();
    }
}
BatchStatusLambda.LambdaName = 'BatchStatus';

// const getDBInterfaces = (services) => {
//     services.documentDB.addDatabaseInterface(Batches, 'batches');
//
//     return services.documentDB.getDatabaseInterfaces();
// };

module.exports = BatchStatusLambda;
