const re       = /https:\/\/discord\.gg\//

export default async (invite) => {
    if (!re.test(invite)) {
        return false;
    }

    const code = invite.replace(re, '');
    try {
        await eris.getInvite(code, true);

        return true;
    } catch (e) {
        console.error(`Failed to fetch invite code "${invite}"`, e)
        return false;
    }
};
