'use strict';

const { existsSync, mkdirSync, writeFileSync } = require('fs');
const { resolve } = require('path');

const swaggerJSDoc = require('swagger-jsdoc');
const jsYaml = require('js-yaml');
const toJsonSchema = require('openapi-schema-to-json-schema');
const _ = require('underscore');

class SwaggerBase {
    constructor(options, endpointOrder, tagOrder, outName) {
        this.options = options;
        this.endpointOrder = endpointOrder;
        this.tagOrder = tagOrder;

        this.outName = outName;
    }

    build() {
        const swagger = swaggerJSDoc(this.options);

        const mappings = [];
        const components = [];

        // loop through each of the components in our generated swagger
        _.each(_.keys(swagger.components.schemas), (key) => {
            const schema = swagger.components.schemas[key];

            // only handle schmeas that have our special keys on them for generating jsonschema
            if (schema['internal-id'] && schema['internal-path']) {
                const id = schema['internal-id'];
                const path = schema['internal-path'];

                // remove the fields from the original schema, as they're invalid in openapi
                delete schema['internal-id'];   // eslint-disable-line no-param-reassign
                delete schema['internal-path']; // eslint-disable-line no-param-reassign

                // convert the openapi fragment to jsonschema
                const parsed = _.extend({ id }, toJsonSchema(schema));

                const reorderRequired = (o) => {
                    if (o.required) {
                        // ok, this probably looks confusing. But... we're treating null like undefined for our validation (i.e, both
                        // report as 'missing' rather than null being 'wrong type'. The module we're using for schema validation
                        // checks for required fields BEFORE triggering the pre-validation function we use to coerce null to undefined,
                        // if it appears earlier in the object. So, this basically ensures 'required' is the last property on the object
                        const { required } = o;
                        delete o.required;      // eslint-disable-line no-param-reassign
                        o.required = required;  // eslint-disable-line no-param-reassign
                    }

                    if (o.properties) {
                        _.each(_.keys(o.properties), (k) => {
                            if (_.isObject(o.properties[k])) {
                                reorderRequired(o.properties[k]);
                            }
                        });
                    }
                };

                reorderRequired(parsed);

                // store the fragment for later
                components.push({ key, path, parsed });
                // and keep track of this id against it's openapi ref path - we'll need this
                mappings.push({ id, path: `#/components/schemas/${key}` });
            }
        });

        _.each(components, (component) => {
            // our openapi fragments refs use root based json pointers (#/components/schemas/X), but our jsonschema need
            //  to use ID based refs. So we need to replace one with the other. Luckily, we created a mapping for these
            //  as we generated the fragments, above.
            let json = JSON.stringify(component.parsed, null, 4);
            _.each(mappings, (mapping) => {
                // replace each json pointer path with it's id
                json = json.replace(mapping.path, mapping.id); // TODO only replaces first instance
            });

            // write the jsonschema back to the directory
            const dir = resolve(`${__dirname}/../../../${component.path}`);
            if (!existsSync(dir)) {
                mkdirSync(dir);
            }
            writeFileSync(`${dir}/${component.key}.json`, json);
        });

        // order the paths so that our API lists POST endpoints first. This ordering is just cleanest for our implementation. If
        //  we need to do any more complex ordering, we'll re-address
        const verbOrder = ['post', 'get', 'patch', 'put', 'delete'];
        const paths = {};
        const sortedKeys = _.chain(swagger.paths)
            .keys()
            .sortBy((k) => {
                const index = this.endpointOrder.indexOf(k);
                return index === -1 ? 99 : index;
            })
            .value();

        _.each(sortedKeys, (pathKey) => {
            const path = swagger.paths[pathKey];
            paths[pathKey] = {};
            _.each(verbOrder, (verbKey) => {
                if (path[verbKey]) {
                    paths[pathKey][verbKey] = path[verbKey];
                }
            });
        });
        swagger.paths = paths;

        // order the tags so that our API spec has the most relevant components first. Swagger paths order is defined by the tag
        //  order
        swagger.tags = _.sortBy(swagger.tags, (tag) => {
            const index = this.tagOrder.indexOf(tag.name);
            return index === -1 ? 99 : index;
        });

        // write out the openapi yaml file to this directory - the post build step will move it to the build output
        mkdirSync(`${__dirname}/.generated/`, { recursive: true });
        const swaggerSpec = jsYaml.dump(swagger, { schema: jsYaml.JSON_SCHEMA, noRefs: true });
        writeFileSync(`${__dirname}/.generated/${this.outName}`, swaggerSpec);

        return swagger;
    }
}

module.exports = SwaggerBase;
