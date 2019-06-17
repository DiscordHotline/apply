const Eris = require('eris');

let initialized = false;

export default {
    initialize: async (app) => {
        if (initialized) {
            return;
        }
        console.log('Initializing Middleware');

        require('../middleware/session')(app);

        console.log('Initializing Eris');
        global.eris = app.eris = new Eris('Bot ' + process.secrets.discord.token, {restMode: true});

        initialized = true;
    },
};
