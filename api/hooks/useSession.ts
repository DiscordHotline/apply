import cookieSession = require('cookie-session');
import useSecret from './useSecret';

export default async function useSession(req, res): Promise<any> {
    const [secret] = await useSecret<{ secret: string }>('hotline/discord');

    const originalSession = cookieSession({
        name:   'session',
        keys:   [secret.secret],
        maxAge: 24 * 60 * 60 * 1000,
    });

    return new Promise((resolve) => originalSession(req, res, () => resolve(req.session)));
}
