import useEris from '../hooks/useEris';

export default async (code) => {
    const eris = await useEris();

    try {
        await eris.getInvite(code, true);

        return true;
    } catch (e) {
        console.error(`Failed to fetch invite code "${code}"`, e);
        return false;
    }
};
