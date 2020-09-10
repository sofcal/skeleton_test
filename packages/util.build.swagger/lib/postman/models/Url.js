'use strict';

const _ = require('underscore');
const _s = require('underscore.string');

const consts = {
    VARIABLES_REGEX: /\{([^}]*)}/g,
    PARAMETER_PREFIX: '#/components/parameters/'
};

class Url {
    constructor(raw, host, pathComponents, pathVariables) {
        this.raw = raw;
        this.host = host;
        this.path = pathComponents;
        this.variable = pathVariables;
    }

    static CreateFromRaw(swaggerPath, swaggerParameters) {
        const postmanPath = getPostmanPath(swaggerPath);
        const postmanVariableNames = getPostmanVariableNames(swaggerPath);

        const raw = `{{_preset_provider_baseUrl}}${postmanPath}`;
        const host = ['{{_preset_provider_baseUrl}}'];
        const pathComponents = _s.words(postmanPath, '/');
        const pathVariables = _.map(postmanVariableNames, (v) => {
            const parameter = swaggerParameters[`${consts.PARAMETER_PREFIX}${v}`];
            return {
                key: v,
                value: `{{${v}}}`,
                description: parameter ? parameter.description : undefined
            };
        });

        return new Url(raw, host, pathComponents, pathVariables);
    }
}

const getPostmanPath = (swaggerPath) => {
    return swaggerPath.replace(consts.VARIABLES_REGEX, ':$1');
};

const getPostmanVariableNames = (path) => {
    const variables = [];
    let m;
    do {
        m = consts.VARIABLES_REGEX.exec(path);
        if (m) {
            variables.push(m[1]);
        }
    } while (m);

    return variables;
};

module.exports = Url;
