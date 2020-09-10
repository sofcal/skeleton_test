'use strict';

module.exports = {
    POST: {
        events: [{
            listen: 'test',
            script: {
                id: '69108fe9-9c84-4b3b-a6e0-7bec155db7cf',
                exec: [
                    'var jsonData = JSON.parse(responseBody);',
                    '',
                    'postman.setEnvironmentVariable(\'statementBatchId\', jsonData.data._id);'
                ],
                type: 'text/javascript'
            }
        }],
        body: {
            mode: 'raw',
            raw: JSON.stringify({
                data: {
                    // we take bankId from environment variables, so we can easily make a new environment for
                    //  a new provider, with access to an account made for them
                    principalId: '{{_preset_consumer_bankId}}'
                }
            }, null, 4)
        }
    }
};
