const definition = require('./definition');
const cfn = require('./cfn');
const fs = require('fs');

console.log('Build started'); // eslint-disable-line no-console

const stringified = JSON.stringify(definition, null, '\t');
const [replacements] = cfn.DefinitionString['Fn::Sub'];

const subRegex = /Resource":\s*?"\${(.*?)}"/g;
let match = subRegex.exec(stringified);

while (match != null) {
    const [, rep] = match;
    if (!replacements[rep]) {
        throw new Error(`Invalid Step Definition. Missing ${rep} in cfn`);
    }
    match = subRegex.exec(stringified);
}

cfn.DefinitionString['Fn::Sub'].unshift(stringified);

fs.writeFileSync(`${__dirname}/step.json`, JSON.stringify(cfn, null, '\t'));

console.log('Build ended'); // eslint-disable-line no-console
