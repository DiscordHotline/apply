const {createConnection, getConnectionManager} = require('typeorm');
const {Entities}         = require('@hotline/application-plugin');

/** @var {Connection} global.connection */
let connection = null;

module.exports = {
    initialize:         async () => {
        if (connection) {
            return;
        }
        console.log('Initializing Database');

        const config = {
            synchronize:       false,
            host:              process.secrets.mainDatabase.dsn,
            database:          process.secrets.database.database,
            port:              3306,
            username:          process.secrets.database.user,
            password:          process.secrets.database.password,
            type:              'mysql',
            supportBigNumbers: true,
            bigNumberStrings:  true,
            entities:          Object.values(Entities),
        };

        if (getConnectionManager().has('default')) {
            await getConnectionManager().get().close();
        }

        connection = await createConnection(config);
    },
    getGuild:           async (id) => {
        return connection.getRepository(Entities.Guild).findOne(id);
    },
    getInvite:          async (code) => {
        return connection.getRepository(Entities.Invite).findOne({code});
    },
    getApplicationByGuildId: async (guildId) => {
        try {
            const qb = connection.createQueryBuilder(Entities.Application, 'a')
                .innerJoinAndSelect(Entities.Guild, 'g')
                .where('g.id = :id', {id: guildId});

            return await qb.getOne();
        } catch (e) {
            console.error(e, e.query);

            throw e;
        }
    }
};
