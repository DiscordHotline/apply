const serverless      = require('serverless-http');
const express         = require('express');
const {join, resolve} = require('path');
const {readdirSync}   = require('fs');
const Eris            = require('eris');

const vault      = require('./util/vault');
const database   = require('./util/database');
const middleware = require('./util/middleware');
const routes     = require('./util/routes');

const app = express();
app
    .use('/assets', express.static(join(__dirname, 'assets')))
    .set('views', resolve(__dirname, 'templates'))
    .set('view engine', 'twig')
    .set('twig options', {allow_async: true, strict_variables: false})
    .get('/logout', async (req, res) => {
        req.logout();
        res.redirect('/');
    });

require('twig').cache(process.env.NODE_ENV === 'prod');

const handler          = serverless(app);
module.exports.handler = async (event, context) => {
    try {
        await vault.initialize();
        await vault.loadSecrets();
        await Promise.all([
            await database.initialize(app),
            await middleware.initialize(app),
            await routes.initialize(app),
        ]);

        return await handler(event, context);
    } catch (e) {
        console.error(e);

        return {
            statusCode: 500,
            body:       JSON.stringify({message: e.message}),
        };
    }
};
