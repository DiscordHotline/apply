import {NowRequest, NowResponse} from '@now/node';
import useSession from '../hooks/useSession';

const baseUrl = process.env.NOW_REGION === 'dev1'
    ? 'http://localhost:3000'
    : 'https://apply.hotline.gg';

export default async (req: NowRequest & { session: any }, res: NowResponse) => {
    // @ts-ignore
    let session = await useSession(req, res);
    session = req.session = null;

    res.statusCode = 301;
    res.setHeader('Location', baseUrl);
    res.end();
}
