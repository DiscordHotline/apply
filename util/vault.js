const Vault = require('node-vault');

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

module.exports = {
    initialize: async () => {
        if (vault !== undefined) {
            return vault;
        }
        console.log('Initializing Vault');

        // Connect to vault
        vault = Vault({endpoint: process.env.VAULT_ADDR});

        // Log in to vault
        try {
            await vault.approleLogin({role_id: process.env.VAULT_ROLE_ID, secret_id: process.env.VAULT_SECRET_ID});
        } catch (e) {
            vault = undefined;
            console.error('Failed to log in to vault.', e);

            throw e;
        }

        process.vault = vault;
    },
    loadSecrets: async () => {
        if (process.secrets !== undefined) {
            return;
        }
        console.log('Loading Secrets from Vault');

        // Fetch the secrets we want
        try {
            const [def, mainDatabase, discord, apply, database] = await Promise.all([
                read('secret/hotline/default', false),
                read('secret/hotline/database'),
                read('secret/hotline/discord'),
                read('secret/hotline/apply/discord'),
                read('secret/hotline/apply/database'),
            ]);

            process.secrets = {default: def, mainDatabase, database, discord, apply};
        } catch (e) {
            console.error(e);

            throw e;
        }
    }
};
