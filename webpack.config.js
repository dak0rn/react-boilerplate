/**
 * webpack.config.js - the webpack configuration
 */
const webpack = require('webpack');
const path = require('path');

// The base configuration
// It is extended and changed based on the current environment
const base = {

    // Create source maps when building
    devtool: 'source-map',

    // Entrypoints
    entry: {

        // The application bundle
        // Has to be an array as it is extended below
        bundle: [
            'babel-polyfill',
            './src/boot.jsx'
        ],

        // Third-party modules are bundled into a separate file
        vendor: [
            'react',
            'seamless-immutable',
            'redux'
        ]
    },


    // Output definition when the project is built
    output: {
        // Store outputs in the 'public' folder
        path: path.resolve('./public'),

        // Path where assets are stored
        // We're serving from root here
        publicPath: '/',

        // The created files are named like their entry point (bundle.js, vendor.js, ...)
        filename: '[name].js'
    },


    // Configure the way source files are handled
    module: {

        // 'rules' were 'loaders' in webpack 1
        // Functions or modules that can pre-process the code before it's emitted
        rules: [
            {
                test: /\.jsx$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                options: {
                    cacheDirectory: '/tmp/',
                    presets: [['es2015', {modules: false}], 'react']
                }
            }
        ]
    },


    // Details for how to find source files
    resolve: {
        extensions: ['.js', '.jsx'],

        // Webpack allows to alias imports
        alias: {
        }
    },


    // Plugins that change the overall behaviour of webpack
    plugins: [
        // Report erroneous code/modules
        new webpack.NoEmitOnErrorsPlugin(),

        // Provide imports when they are named
        new webpack.ProvidePlugin({

            // By providing React automatically, we don't have to import it in every file but can use
            //   import { Component } from 'react';
            React: 'react',

            // Polyfills for promises and whatwg-fetch
            'fetch': 'imports?this=>global!exports?global.fetch!whatwg-fetch'
        })
    ]
};

// The different generators
const generators = {

    /**
     * Creates the configuration for the development
     *
     * @param {Immutable<Object>} config Base configuration
     * @return {Immutable<Object>}
     */
    development(config) {
        // Add the HMR plugin to babel
        config.module.rules[0].options.plugins = ['react-hot-loader/babel'];

        return Object.assign(config, {

            // Eval is way faster for the development
            devtool: 'eval',

            // Entrypoints are slightly different during the development
            entry: Object.assign(config.entry, {
                bundle: [
                    'webpack-dev-server/client?http://localhost:8080/',
                    'webpack/hot/only-dev-server',
                    'react-hot-loader/patch'
                ].concat(config.entry.bundle)
            }),

            // Watch for changes and use a cache
            watch: true,
            cache: true,

            // Settings for the development server
            devServer: {
                // Allow external access
                host: '0.0.0.0',

                port: 8080,

                // Static resources are served from 'public'
                contentBase: 'public',

                // We want to use hot module replacement
                hot: true,

                // Serve everything from index.html if not found
                historyApiFallback: true,

                // Proxy configuration
                // https://webpack.js.org/configuration/dev-server/#devserver-proxy
                // If you use an API, make it accessible via this configuration
                /* e.g.:
                proxy: {
                    '/api': {
                        target: 'http://backend.service.consul:3000',
                        pathRewrite: { '^api': '' }
                    }
                }
                */
            },

            // We also need more plugins
            plugins: config.plugins.concat([
                // Globally activate HMR
                new webpack.HotModuleReplacementPlugin(),

                // Better names
                new webpack.NamedModulesPlugin(),

                // We also add a global __DEV__ variable
                new webpack.DefinePlugin({
                    '__DEV__': true,
                    'process.env.NODE_ENV': JSON.stringify('development')
                })
            ])
        });
    }
};

// Choose the right generator based on the environment
const currentEnv = (process.env.NODE_ENV || 'development').toLowerCase();

module.exports = generators[currentEnv](base);
