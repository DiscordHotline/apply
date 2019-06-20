import {NowRequest, NowResponse} from '@now/node';

const withErrors = (handler) => (req: NowRequest, res: NowResponse) => {
    try {
        return handler(req, res);
    } catch (e) {
        console.error(e);
        res
            .status(e.status)
            .json({message: e.message});
    }
};

export default withErrors;
