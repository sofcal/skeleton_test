const slsw = require('serverless-webpack');
// const webpack = require('webpack');

const config = {
    entry: slsw.lib.entries,
    target: 'node',
    mode: 'production',
    node: {
        __dirname: false,
    },
    optimization: {
        // We no not want to minimize our code.
        minimize: false
    },
    externals: [
        'aws-sdk'
    ],
    module: {
    },
    plugins: [
    ]
};

console.log('_____CONFIG', config);
module.exports = config;
