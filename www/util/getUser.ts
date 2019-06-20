import fetch from 'isomorphic-unfetch';
import {NextContext} from 'next';

const url = process.env.NOW_REGION === 'dev1'
    ? 'http://localhost:3000'
    : 'https://apply.hotline.gg';

export default async function getUser(ctx: NextContext) {
    const opts: RequestInit = {credentials: 'include'};
    if (ctx.req) {
        opts.headers = {
            Cookie: await ctx.req.headers.cookie,
        };
    }

    let response;
    try {
        response = await fetch(url + '/session', opts);
    } catch (e) {
        console.log('Session not okay', e);

        return null;
    }

    if (!response.ok) {
        console.log('Session not okay', response.statusText);

        return null;
    }

    const json = await response.json();
    if (!json.token || !json.user) {
        return null;
    }

    return {
        ...json.user,
        ...json.token,
    };
}
