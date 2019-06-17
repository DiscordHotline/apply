import {NowRequest, NowResponse} from '@now/node/dist';
import useAuthentication from '../hooks/useAuthentication';
import useSession from '../hooks/useSession';

export default async (req: NowRequest, res: NowResponse) => {
    const session = await useSession(req, res);
    const [user]  = await useAuthentication(req, res, false);

    return res.send({token: session.token, scopes: session.scopes, user});
}
