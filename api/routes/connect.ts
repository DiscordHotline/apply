import {NowRequest, NowResponse} from '@now/node';
import {stringify} from 'querystring';
import useSecret from '../hooks/useSecret';
import useSession from '../hooks/useSession';
import getUrl from '../util/getUrl';

interface Secret {
    client_id: string
}

export default async (req: NowRequest, res: NowResponse) => {
    const session = await useSession(req, res);
    const scopes = ['identify', 'guilds.join'];
    if (req.query && req.query.scopes) {
        scopes.push(...Array.isArray(req.query.scopes) ? req.query.scopes : req.query.scopes.split(','));
    }
    session.scopes = scopes;
    if (req.query && req.query.previousUrl) {
        session.previousUrl = req.query.previousUrl;
    }

    const [{client_id}] = await useSecret<Secret>('hotline/discord');
    const url      = 'https://discordapp.com/oauth2/authorize?';
    const redirect = url + stringify({
        response_type: 'code',
        scope:         scopes.join(' '),
        redirect_uri:  `${getUrl(req)}/connect/callback`,
        prompt:        'none',
        client_id,
    });

    res.statusCode = 301;
    res.setHeader('Location', redirect);
    res.end();
}
