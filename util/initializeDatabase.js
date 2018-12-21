const mysql = require('mysql');

let connection;
let connected = false;

module.exports = async () => {
    // If vault exists, we've done this already.
    if (connected) {
        return connection;
    }

    connection = mysql.createConnection({
        host:     process.secrets.mainDatabase.dsn,
        user:     process.secrets.database.user,
        password: process.secrets.database.password,
        database: process.secrets.database.database,
    });

    return new Promise((resolve, reject) => connection.connect((err) => err ? reject(err) : resolve(connection)));
};
