const {join, resolve} = require('path');
const {readdirSync}   = require('fs');

global.initialized = false;

module.exports = {
    initialize: async (app) => {
        if (initialized) {
            return;
        }
        console.log('Initializing Routes');

        const path = join(__dirname, '..', 'routes');
        readdirSync(path).forEach(file => require(resolve(path, file))(app));
        initialized = true;
    },
};
