import {NowRequest, NowResponse} from '@now/node';
import withErrors from '../hocs/withErrors';

import useAuthentication from '../hooks/useAuthentication';
import useDatabase from '../hooks/useDatabase';

export default withErrors(async (req: NowRequest, res: NowResponse) => {
    await useAuthentication(req, res, true);
    const {getInvite} = await useDatabase();

    const invite = await getInvite(req.query.code);
    if (!invite || invite.revoked) {
        return res.status(400).json({invalid: true, success: false, guild: null});
    }

    return res.status(200).json({invalid: false, guild: invite.guild, success: true});
});
