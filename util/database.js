const mysql = require('mysql');

let connection;
let connected = false;

module.exports = {
    initialize: async (app) => {
        if (connection) {
            app.database = connection;
            return;
        }
        console.log('Initializing Database');

        return new Promise((resolve, reject) => {
            connection = mysql.createConnection({
                host:     process.secrets.mainDatabase.dsn,
                user:     process.secrets.database.user,
                password: process.secrets.database.password,
                database: process.secrets.database.database,
            });

            connection.connect(err => {
                if (err) {
                    return reject(err);
                }

                app.database = connection;
                resolve();
            })
        })
    }
};
