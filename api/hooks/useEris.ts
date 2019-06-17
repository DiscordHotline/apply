import {Client as Eris} from 'eris';

import useSecret from './useSecret';

let eris: Eris;

export default async function useEris() {
    if (!eris) {
        const [secret] = await useSecret<{ token: string }>('hotline/apply/discord');

        eris = new Eris(`Bot ${secret.token}`, {restMode: true});
    }

    return eris;
}
