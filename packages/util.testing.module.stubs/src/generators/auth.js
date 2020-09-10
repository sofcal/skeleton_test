const needle = require('needle');

const providerIdentities = {
    runStep: 'fSGWmP9JgqWzwW0A2B55euqp2LPk35YZ',
    skipStep: 'JvPdek55ZmUFhNaAQrx2KXcjJbqkgyGf'
};

const cloudIdInfos = {};
cloudIdInfos[providerIdentities.runStep] = {
    token: null,
    apiKey: 'ap5S8tFpD36EmwWx3AM9taShLjPpcPWH34NbgNYu',
    url: 'https://id-shadow.sage.com/oauth/token',
    request: {
        grant_type: 'client_credentials',
        client_id: providerIdentities.runStep,
        client_secret: 'YVlhb5OrVKDwpofZg_WMt0SI58amQntYFPciGPql_8LBAy3gOukYblWG_Di6durw',
        audience: 'bankingclouddev/sfdsBankingProvider'
    }
};

module.exports = (providerIdentity) => {
    return async(endpoint, isLocal) => {
        const headers = {};

        return {
            // headers will be used in real requests to lambdas
            headers,
            // authorizer value will be used in requests to local lambdas
            authorizerResponse: {

            }
        };
    };
};

// functions are just objects. You can assign properties. Though I wouldn't really recommend it for production code.
module.exports.providerIdentities = providerIdentities;
