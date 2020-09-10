'use strict';

const { FuzzyAccess } = require('@sage/bc-util-fuzzyaccess');

const product = require('../../../../package.json').short;

module.exports = (nock) => {
    const { AWS_REGION: region, environment } = FuzzyAccess.GetMany(process.env, ['AWS_REGION', 'environment']);

    // allow access to locally run services (dynamo)
    nock.enableNetConnect('127.0.0.1');
    nock.enableNetConnect('localhost');
    nock.enableNetConnect('localhost:8000');
    ssm(region, environment, nock);
};

const ssm = (region, environment, nock) => {
    const url = `https://ssm.${region}.amazonaws.com:443`;
    const response = JSON.stringify({
        InvalidParameters: [],
        Parameters: [{
            ARN: `arn:aws:ssm:${region}:000000000000:parameter/${product}-${environment}/cfn-exports/Services.DB.TableName`,
            LastModifiedDate: 1571007593.427,
            Name: `/${product}-${environment}/cfn-exports/Services.DB.TableName`,
            Type: 'String',
            Value: `${product}-local-local-v1-Data`,
            Version: 1
        }, {
            ARN: `arn:aws:ssm:${region}:000000000000:parameter/${product}-${environment}/cfn-exports/Services.DB.Endpoint`,
            LastModifiedDate: 1571007593.427,
            Name: `/${product}-${environment}/cfn-exports/Services.DB.Endpoint`,
            Type: 'String',
            Value: 'http://localhost:8000',
            Version: 1
        }]
    });

    const expectedBody = {
        Names: [
            `/${product}-${environment}/cfn-exports/Services.DB.Endpoint`,
            `/${product}-${environment}/cfn-exports/Services.DB.TableName`
        ],
        WithDecryption: true
    };

    nock(url)
        .persist()
        .post('/', expectedBody)
        .reply(200, response);
};
