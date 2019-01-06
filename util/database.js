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
    getInvite: async (inviteCode) => {
        const sql     = 'SELECT * FROM `invites` WHERE `code` = ?';
        const result = (await query(sql, [inviteCode]))[0];

        if (result && result.useMetadata) {
            result.useMetadata = JSON.parse(result.useMetadata)
        }

        return result;
    },
    getApplicationById: async (applicationId) => {
        const sql     = 'SELECT * FROM `applications` WHERE `id` = ?';
        const results = await query(sql, [applicationId]);

        return results[0];
    },
    getApplicationByInviteCode: async (code) => {
        const sql     = 'SELECT * FROM `applications` WHERE `hotline_invite_code` = ?';
        const results = await query(sql, [code]);

        return results[0];
    },
    getApplicationByServerId: async (serverId) => {
        const sql     = 'SELECT * FROM `applications` WHERE `server_id` = ?';
        const results = await query(sql, [serverId]);

        return results[0];
    }
};
