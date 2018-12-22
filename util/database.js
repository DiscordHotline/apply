let connection = require('serverless-mysql')();
let configured = false;

const query = async (sql, values) => connection.query({
    sql, values, typeCast: function (field, next) {
        if (field.type === 'LONGLONG') {
            return field.string();
        }

        return next();
    },
});

module.exports = {
    initialize:                 async () => {
        if (configured) {
            return;
        }
        console.log('Initializing Database');

        connection.config({
            host:     process.secrets.mainDatabase.dsn,
            user:     process.secrets.database.user,
            password: process.secrets.database.password,
            database: process.secrets.database.database,
            typeCast: false,
        });

        configured = true;
    },
    query,
    getApplicationByInviteCode: async (code) => {
        const sql     = 'SELECT * FROM `applications` WHERE `hotline_invite_code` = ?';
        const results = await query(sql, [code]);

        return results[0];
    },
};
