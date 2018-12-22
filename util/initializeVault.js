const InitializeVault = require('node-vault');

let vault;
let initialized = false;

async function read(secret, required = true) {
    try {
        return (
            await vault.read(secret)
        ).data;
    } catch (e) {
        if (!required && e.message === 'Status 404') {
            return {};
        } else if (required && e.message === 'Status 404') {
            throw new Error('Failed to find required secrets under the path: ' + secret);
        }

        throw e;
    }
}

module.exports = async (callback) => {
    // If vault exists, we've done this already.
    if (vault !== undefined || !initialized) {
        return vault;
    }

    // Connect to vault
    vault = InitializeVault({endpoint: process.env.VAULT_ADDR});

    // Log in to vault
    try {
        await vault.approleLogin({role_id: process.env.VAULT_ROLE_ID, secret_id: process.env.VAULT_SECRET_ID});
    } catch (e) {
        console.error('Failed to log in to vault.', e);

        throw e;
    }

    // Fetch the secrets we want
    try {
        const [def, mainDatabase, discord, apply, database] = await Promise.all([
            read('secret/hotline/default', false),
            read('secret/hotline/database'),
            read('secret/hotline/discord'),
            read('secret/hotline/apply/discord'),
            read('secret/hotline/apply/database'),
        ]);

        process.vault   = vault;
        process.secrets = {default: def, mainDatabase, database, discord, apply};

        await callback(vault);

        return vault;
    } catch (e) {
        console.error(e);

        throw e;
    }
};
