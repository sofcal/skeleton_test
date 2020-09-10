'use strict';

module.exports = {
    POST: {
        body: {
            mode: 'raw',
            raw: JSON.stringify({
                data: [{
                    bankAccountId: '{{consumer_bankAccountId}}',
                    status: 'active',
                    ledgerBalance: 0,
                    ledgerBalanceDate: '2019-11-24T12:00:00.000Z', // balance dates aren't validated, so we can leave this as a default
                    availableBalance: 0,
                    availableBalanceDate: '2019-11-24T12:00:00.000Z'  // balance dates aren't validated, so we can leave this as a default
                }]
            }, null, 4)
        }
    }
};
