import {NowRequest, NowResponse} from '@now/node';
import {createError} from 'micro';
import fetch from 'node-fetch';
import useSession from './useSession';

const url = 'https://discordapp.com/api';

const apiFetch = async (route: string, accessToken: string) => {
    let response;
    try {
        response = await fetch(`${url}${route}`, {headers: {Authorization: 'Bearer ' + accessToken}});
    } catch (e) {
        throw createError(500, `Failed to fetch: ${route}.`, e);
    }

    if (!response.ok) {
        throw createError(response.status, response.statusText);
    }

    const json = await response.json();
    if (json.error) {
        throw createError(400, json.error_description);
    }

    return json;
};

const getUser = async (accessToken: string) => {
    return apiFetch('/users/@me', accessToken);
};

const getGuilds = (accessToken: string) => {
    return apiFetch('/users/@me/guilds', accessToken);
};

export default async function useAuthentication(
    req: NowRequest,
    res: NowResponse,
    required: boolean = true,
): Promise<[any]> {
    const session = await useSession(req, res);
    if ((!session || !session.token) && required) {
        throw createError(401, 'Authorization Required');
    } else if (!session || !session.token) {
        return [null];
    }

    const user = await getUser(session.token.access_token);
    user.guilds = await getGuilds(session.token.access_token);

    return [user];
}


