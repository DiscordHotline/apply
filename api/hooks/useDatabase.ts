import {Entities} from '@hotline/application-plugin';
import {Connection, ConnectionOptions, createConnection, getConnectionManager} from 'typeorm';

import useSecret from './useSecret';

let database: Connection;

const getCredentials = async () => {
    const [secretOne] = await useSecret<{ dsn: string, host: string }>('hotline/database');
    const [secretTwo] = await useSecret<{ database: string, password: string, user: string }>('hotline/apply/database');

    return {...secretOne, ...secretTwo};
};

const getGuild = async (id: string) => {
    return database.getRepository(Entities.Guild).findOne({guildId: id});
};

const getInvite = async (code: string) => {
    return database.getRepository(Entities.Invite).findOne(code);
};

export default async function useDatabase() {
    if (!database) {
        const credentials               = await getCredentials();
        const config: ConnectionOptions = {
            synchronize:       false,
            host:              credentials.dsn,
            database:          credentials.database,
            port:              3306,
            username:          credentials.user,
            password:          credentials.password,
            type:              'mysql',
            supportBigNumbers: true,
            bigNumberStrings:  true,
            entities:          Object.values(Entities),
        };

        if (getConnectionManager().has('default')) {
            database = getConnectionManager().get('default');
        } else {
            database = await createConnection(config);
        }
    }

    return {database, getGuild, getInvite};
}
