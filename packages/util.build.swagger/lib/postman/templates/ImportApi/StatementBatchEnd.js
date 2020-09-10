'use strict';

module.exports = {
    POST: {
        body: {
            mode: 'raw',
            raw: JSON.stringify({
                data: {
                    expected: {
                        // we push two transactions in our demo data, which allows us to always cancel out the balances and
                        // leave the actual balances at 0. This means we can re-rerun this post multiple times
                        transactionDetailsCount: 2,
                        accountDetailsCount: 1,
                        transactionCreditSum: 100,
                        transactionDebitSum: -100
                    }
                }
            }, null, 4)
        }
    }
};
