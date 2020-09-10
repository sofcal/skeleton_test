'use strict';

module.exports = {
    POST: {
        events: [{
            listen: 'test',
            script: {
                id: '2686ca39-5105-477c-bcf9-4c056282c8d6',
                exec: [
                    'var jsonData = JSON.parse(responseBody);',
                    '',
                    'postman.setEnvironmentVariable(\'statementId\', jsonData.data._id);'
                ],
                type: 'text/javascript'
            }
        }, {
            listen: 'prerequest',
            script: {
                id: 'f73b4f4f-a300-4f70-8bfc-b843470d3acf',
                exec: [
                    'var guid = (() => {',
                    '  const s4 = () => {',
                    '    return Math.floor((1 + Math.random()) * 0x10000)',
                    '               .toString(16)',
                    '               .substring(1);',
                    '  };',
                    '',
                    '  return () => `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;', // eslint-disable-line no-template-curly-in-string
                    '})();',
                    '',
                    'postman.setEnvironmentVariable(\'uniqueId_1\', guid());',
                    'postman.setEnvironmentVariable(\'uniqueId_2\', guid());'
                ],
                type: 'text/javascript'
            }
        }],
        body: {
            mode: 'raw',
            raw: JSON.stringify({
                data: {
                    // we take bankId and bankAccountId from environment variables, so we can easily make a new environment for
                    //  a new provider, with access to an account made for them
                    principalId: '{{consumer_bankAccountId}}',
                    bankId: '{{_preset_consumer_bankId}}',
                    expected: {
                        // we push two transactions in our demo data, which allows us to always cancel out the balances and
                        // leave the actual balances at 0. This means we can re-rerun this post multiple times
                        transactionDetailsCount: 2,
                        accountDetailsCount: 1,
                        transactionCreditSum: 100,
                        transactionDebitSum: -100
                    },
                    accountDetails: [{
                        bankAccountId: '{{consumer_bankAccountId}}',
                        status: 'active',
                        ledgerBalance: 0,
                        ledgerBalanceDate: '2019-11-24T12:00:00.000Z', // balance dates aren't validated, so we can leave this as a default
                        availableBalance: 0,
                        availableBalanceDate: '2019-11-24T12:00:00.000Z'  // balance dates aren't validated, so we can leave this as a default
                    }],
                    transactionDetails: [{
                        uniqueId: '{{uniqueId_1}}', // we'll generate new uniqueIds in a pre-request script. This allows us to ensure we always have unique ids
                        bankAccountId: '{{consumer_bankAccountId}}',
                        transactionAmount: 100,
                        transactionType: 'CREDIT',
                        transactionStatus: 'posted',
                        datePosted: '2019-11-02T23:00:12.000Z',
                        dateUserInitiated: '2019-11-04T22:54:00.000Z',
                        exchangeCurrency: 'EUR',
                        exchangeAmount: 120,
                        checkNumber: '123456',
                        referenceNumber: '00000001',
                        description: 'DEBIT DESCRIPTION {{uniqueId_1}}',
                        payee: {
                            payeeDescription: '100001',
                            address1: '1 the something',
                            address2: 'on some street',
                            address3: 'on some estate',
                            city: 'in a city',
                            state: 'in a state',
                            postalCode: 'MY POST CODE',
                            country: 'GBR',
                            phoneNumber: '0091299291212',
                            payeeBankId: '123456',
                            payeeAccountId: '654321'
                        },
                        coordinates: {
                            lat: 0.9812,
                            long: 1.0238
                        },
                        narrative1: 'DEBIT NARRATIVE {{uniqueId_1}}',
                        narrative2: 'DEBIT EXTENDED NARRATIVE {{uniqueId_1}}',
                        category: {
                            topLevelCategory: 'TopCategory',
                            subCategory: 'SubCategory',
                            categoryId: 12,
                            standardIndustrialCode: '9089'
                        }
                    }, {
                        uniqueId: '{{uniqueId_2}}', // we'll generate new uniqueIds in a pre-request script. This allows us to ensure we always have unique ids
                        bankAccountId: '{{consumer_bankAccountId}}',
                        transactionAmount: -100,
                        transactionType: 'DEBIT',
                        transactionStatus: 'posted',
                        datePosted: '2019-11-02T23:00:12.000Z',
                        dateUserInitiated: '2019-11-04T22:54:00.000Z',
                        exchangeCurrency: 'EUR',
                        exchangeAmount: -120,
                        checkNumber: '123456',
                        referenceNumber: '00000002',
                        description: 'DEBIT DESCRIPTION {{uniqueId_2}}',
                        payee: {
                            payeeDescription: '100001',
                            address1: '1 the something',
                            address2: 'on some street',
                            address3: 'on some estate',
                            city: 'in a city',
                            state: 'in a state',
                            postalCode: 'MY POST CODE',
                            country: 'GBR',
                            phoneNumber: '0091299291212',
                            payeeBankId: '123456',
                            payeeAccountId: '654321'
                        },
                        coordinates: {
                            lat: 0.9812,
                            long: 1.0238
                        },
                        narrative1: 'DEBIT NARRATIVE {{uniqueId_2}}',
                        narrative2: 'DEBIT EXTENDED NARRATIVE {{uniqueId_2}}',
                        category: {
                            topLevelCategory: 'TopCategory',
                            subCategory: 'SubCategory',
                            categoryId: 12,
                            standardIndustrialCode: '9089'
                        }
                    }]
                }
            }, null, 4)
        }
    }
};
