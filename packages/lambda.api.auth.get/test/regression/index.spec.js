'use strict';

const Lambda = require('../../lib/Lambda');

const { generators, stubs } = require('@sage/bnkc-fnb-util-testing-stubs');
const { TestRunner } = require('@sage/bc-debug-testrunner');
const { TestConnectorsDB } = require('@sage/bc-servicelayer-db-plugins-connectorsdb');

const should = require('should');

TestRunner.product = require('../../../../package').short;

describe('@sage/bnkc-fnb-api-temp-post', async function() {
    let testRunner;
    let collections;

    before(async () => {
        /**
         * BoilerPlate set up. Creates the test runner; which in turn creates database connections and stubs
         *  see TestRunner for details
         */
        testRunner = TestRunner.Create({
            uut: Lambda,
            urlGenerator: generators.url,
            mappingGenerator: generators.mappings,
            authGenerator: generators.auth(),
            type: TestRunner.types.api,
            stubGenerator: (nock) => stubs.connectorsDB(nock),
            databases: [{ Type: TestConnectorsDB, collections: [] }]
        });
        await testRunner.connect();
        collections = testRunner.collections;
    });

    afterEach(async () => {
        testRunner.setAuthGenerator(generators.auth());
        await testRunner.clean()
    });
    after(async () => testRunner.dispose());

    /** Endpoint generator for this function. BaseURL will be determined by the test runner */
    const endpoint = (...args) => `/v1/auth`;

    describe('2XX', () => {
        it('should return 200; batch not failed', async () => {
            const { statusCode, body } = await testRunner.invoke('get', endpoint());

            should(statusCode).eql(200);
        });
    });
});
