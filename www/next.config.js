const withTypescript     = require('@zeit/next-typescript');

const isProd = process.env.NODE_ENV === 'production';

const config = withTypescript(
    {
        target:               'serverless',
        webpack(newConfig) {
            newConfig.output.jsonpFunction = 'webpackJsonP';
            if (isProd) {
                newConfig.optimization.minimize = true;
            }

            return newConfig;
        },
    },
);

module.exports = config;
