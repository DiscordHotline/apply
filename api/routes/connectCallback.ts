import {NowRequest, NowResponse} from '@now/node';
import {createError} from 'micro';
import fetch from 'node-fetch';
import {stringify} from 'querystring';

import useSecret from '../hooks/useSecret';
import useSession from '../hooks/useSession';
import getUrl from '../util/getUrl';

interface Secret {
    client_id: string;
    secret: string;
}

export default async (req: NowRequest, res: NowResponse) => {
    if (!req.query) {
        throw createError(400, 'Code missing');
    }

    const session = await useSession(req, res);

    const [{client_id, secret: client_secret}] = await useSecret<Secret>('hotline/discord');

    try {
        const response = await fetch(
            'https://discordapp.com/api/v6/oauth2/token',
            {
                method:  'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                body:    stringify({
                    grant_type:   'authorization_code',
                    code:         req.query.code,
                    scope:        session.scopes.join(' '),
                    redirect_uri: `${getUrl(req)}/connect/callback`,
                    client_id,
                    client_secret,
                }),
            },
        );

        const json = await response.json();
        if (json.error) {
            throw createError(400, json.error_description);
        }
        session.token = json;

        res.statusCode = 301;
        res.setHeader('Location', getUrl(req));
        res.end();
    } catch (e) {
        console.log(Object.keys(e));
        throw createError(400, 'Failed to log in.', e);
    }
}
