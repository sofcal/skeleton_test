'use strict';

const MethodItem = require('./models/MethodItem');
const ComponentItemCollection = require('./models/ComponentItemCollection');
const PostmanItemCollection = require('./models/PostmanItemCollection');

const { mkdirSync, writeFileSync } = require('fs');

const _ = require('underscore');
const _s = require('underscore.string');

class PostmanBase {
    constructor(outName, id, templates) {
        this.id = id;
        this.templates = templates;
        this.outName = outName;
    }

    build(swagger) {
        const swaggerComponents = getSwaggerComponents(swagger.components);

        const postman = PostmanItemCollection.CreateFromRaw(swagger.info, { id: this.id });

        let activeCollection = postman;

        _.each(_.keys(swagger.paths), (path) => {
            const trimmed = _s.ltrim(path, '/');
            const splits = _s.words(trimmed, '/');

            _.each(splits, (split) => {
                let component = activeCollection.findItem(split);
                if (!component) {
                    component = ComponentItemCollection.CreateFromRaw(split);
                    activeCollection.add(component);
                }

                activeCollection = component;
            });

            const verbs = swagger.paths[path];
            const operations = _.keys(verbs);

            _.each(operations, (swaggerMethod) => {
                const swaggerItem = verbs[swaggerMethod];

                activeCollection.add(MethodItem.CreateFromRaw(path, swaggerMethod, swaggerItem, swaggerComponents, this.templates));
            });

            activeCollection = postman;

            //
            // console.log('\n\n--------------------------\n\n');
            // console.log(swagger.paths[path]);
            // console.log('\n\n--------------------------\n\n')
        });

        // console.log('\n\n\n\n\n');
        // console.log(util.inspect(postman, false, null, 1));

        const json = JSON.stringify(postman, null, 4);
        mkdirSync(`${__dirname}/.generated/`, { recursive: true });
        writeFileSync(`${__dirname}/.generated/${this.outName}`, json);
    }
}

const getSwaggerComponents = (components = {}) => {
    const schemas = {};
    _.each(_.keys(components.schemas), (key) => {
        schemas[`#/components/schemas/${key}`] = components.schemas[key];
    });

    const parameters = {};
    _.each(_.keys(components.parameters), (key) => {
        parameters[`#/components/parameters/${key}`] = components.parameters[key];
    });

    const securities = {};
    _.each(_.keys(components.securitySchemes), (key) => {
        securities[key] = components.securitySchemes[key];
    });

    return { schemas, parameters, securities };
};

module.exports = PostmanBase;
