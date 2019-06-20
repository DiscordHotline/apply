import {NextContext} from 'next';
import Router from 'next/router';
import {useContext, useState} from 'react';

import {AuthContext} from '../hooks/useAuthContext';
import getApiUrl from '../util/getApiUrl';

const Page = ({guild, code}) => {
    const user                          = useContext(AuthContext);
    const [joined, setJoined]           = useState<boolean>(null);
    const [joining, setJoining]         = useState(false);
    const [errorReason, setErrorReason] = useState<string>(null);

    if (!user) {
        return Router.replace('/connect');
    }

    const join = async (e) => {
        e.preventDefault();
        setJoining(true);
        setErrorReason(null);

        try {
            const response = await fetch('/' + code, {credentials: 'same-origin', method: 'post'});
            const json     = await response.json();
            console.log(json);

            setJoined(json.success);
            setErrorReason(json.error);
        } catch (e) {
            setJoined(false);
            setErrorReason(null);
        } finally {
            setJoining(false);
        }
    };

    return (
        <div className="card">
            <div className="card-content">
                <h1 className="title is-2 has-text-centered">
                    Join Discord Hotline
                </h1>

                <hr/>

                <div className="content">
                    <p>Hello {user.username},</p>
                    {joined === null && !!guild && <>
                        <p>
                            You have been accepted into the Discord Hotline community as a part of:
                        </p>
                        <h3 className="is-title is-3 has-text-centered">{guild.name}</h3>
                        <br/>
                        <p>
                            Click the link below, and you will be added to the server. If you are the server owner, or
                            server representative, message a member of staff when you join.
                        </p>
                        {joined === null && !joining && <button className="button is-info is-outlined is-fullwidth"
                            onClick={join}>
                            Join the Community!
                        </button>}
                        {joined === null && joining && <button className="button is-info is-fullwidth" disabled>
                            Joining the Community!
                        </button>}
                        {joined === true && !joining && <button className="button is-success is-fullwidth" disabled>
                            Joined the Community!
                        </button>}
                        {joined === false && !joining && <button className="button is-danger is-fullwidth" disabled>
                            Failed tp join the Community!
                        </button>}
                    </>}
                    {!joined && !guild && <p>Unfortunately, this invite link is invalid or expired.</p>}
                    {joined === true && <p>
                        You have been successfully added to the community! You can close this window.
                    </p>}
                    {joined === false && errorReason && <>
                        <p>
                            We could not add you at this time for the following reason: <h3>{errorReason}</h3>
                        </p>
                        <br/>
                        <p>
                            Please contact the person who sent you this link or a Discord Hotline administrator
                            if you continue having issues to get this sorted.
                        </p>
                    </>}
                    {joined === false && !errorReason && <p>
                        We could not add you at this time. Please contact the person who sent you this link
                        or a Discord Hotline administrator to get this sorted.
                    </p>}
                </div>
            </div>
        </div>
    );
};

Page.getInitialProps = async ({req, res, query}: NextContext) => {
    if (!req.headers.cookie) {
        res.statusCode = 301;
        res.setHeader('Location', getApiUrl() + '/connect');
        res.end();

        return;
    }

    const response = await fetch(getApiUrl() + '/guildByCode/' + query.code, {headers: {cookie: req.headers.cookie}});
    const json     = await response.json();

    return {guild: json.guild, code: query.code};
};

export default Page;
