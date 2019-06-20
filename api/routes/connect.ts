import {NowRequest, NowResponse} from '@now/node/dist';
import {stringify} from 'querystring';
import useSecret from '../hooks/useSecret';
import useSession from '../hooks/useSession';
import getUrl from '../util/getUrl';

interface Secret {
    client_id: string;
    // secret: string;
}

export default async (req: NowRequest, res: NowResponse) => {
    const session = await useSession(req, res);
    const scopes = ['identify', 'guilds.join'];
    if (req.query && req.query.scopes) {
        scopes.push(...Array.isArray(req.query.scopes) ? req.query.scopes : req.query.scopes.split(','));
    }
    session.scopes = scopes;

    const [secret] = await useSecret<Secret>('hotline/discord');
    const url      = 'https://discordapp.com/oauth2/authorize?';
    const redirect = url + stringify({
        response_type: 'code',
        scope:         scopes.join(' '),
        redirect_uri:  `${getUrl(req)}/connect/callback`,
        ...secret,
    });

    res.statusCode = 301;
    res.setHeader('Location', redirect);
    res.end();
}
