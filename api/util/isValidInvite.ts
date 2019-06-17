import useEris from '../hooks/useEris';

const re       = /https:\/\/discord\.gg\//

export default async (invite) => {
    const eris = await useEris();

    if (!re.test(invite)) {
        return false;
    }

    const code = invite.replace(re, '');
    try {
        await eris.getInvite(code, true);

        return true;
    } catch (e) {
        console.error(`Failed to fetch invite code "${invite}"`, e);
        return false;
    }
};
