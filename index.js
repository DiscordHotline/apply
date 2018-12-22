const serverless      = require('serverless-http');
const express         = require('express');
const {join, resolve} = require('path');
const {readdirSync}   = require('fs');
const Eris            = require('eris');

const initializeVault    = require('./util/initializeVault');
const initializeDatabase = require('./util/initializeDatabase');

const app = express();
app
    .use('/assets', express.static(join(__dirname, 'assets')))
    .set('views', resolve(__dirname, 'templates'))
    .set('view engine', 'twig')
    .set('twig options', {allow_async: true, strict_variables: false});

require('twig').cache(process.env.NODE_ENV === 'prod');

const handler          = serverless(app);
module.exports.handler = async (event, context) => {
    try {
        console.log('Initializing Vault');
        await initializeVault(async () => {
            console.log('Vault Initialized');
            try {

                require('./middleware/session')(app);
                app.get('/logout', async (req, res) => {
                    req.logout();
                    res.redirect('/');
                });
                readdirSync(join(__dirname, './routes')).forEach(file => require(`./routes/${file}`)(app));
                console.log('Initializing Database');
                app.database = await initializeDatabase();
                console.log('Initializing Eris');
                app.eris     = new Eris('Bot ' + process.secrets.discord.token, {restMode: true});
            } catch (e) {
                console.error(e);
            }
        });

        return await handler(event, context);
    } catch (e) {
        console.error(e);

        return {
            statusCode: 500,
            body:       JSON.stringify({message: e.message}),
        };
    }
};
