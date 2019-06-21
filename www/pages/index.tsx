import {useContext, useState} from 'react';
import useForm from 'react-hook-form';

import {AuthContext} from '../hooks/useAuthContext';

interface Form {
    server?: string;
    reason?: string;
    invite?: string;
}

export default () => {
    const {register, handleSubmit, formState, errors, reset, setError} = useForm<Form>();

    const user                                = useContext(AuthContext);
    const [success, setSuccess]               = useState(false);
    const [alreadyApplied, setAlreadyApplied] = useState(false);

    const onSubmit = async (data) => {
        const response = await fetch('/submit', {
            method:      'POST',
            body:        JSON.stringify(data),
            credentials: 'same-origin',
            headers:     {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok && response.status >= 500) {
            console.log('Not OK', response.status);

            return setSuccess(false);
        }

        const json = await response.json();
        for (const field of Object.keys(json.errors || {})) {
            const value = json.errors[field];
            setError(field as keyof Form, 'generic', value);
        }

        setSuccess(json.success);
        setAlreadyApplied(json.alreadyApplied);
    };

    return (
        <div className="card">
            <div className="card-content">
                <h1 className="title is-2 has-text-centered">
                    Apply to Discord Hotline
                </h1>

                <hr/>

                <div className="content">
                    {user && <p>Hello {user.username},</p>}
                    <p>
                        Discord Hotline is a community network of moderators from a multitude of servers.
                        Whether you have questions about other servers' moderation, want to collaborate,
                        or simply want to connect with fellow moderators, you can do it here. We also
                        feature an early warning system for problematic users and raids.
                    </p>

                    {!formState.isSubmitted && <p>
                        If you would like to apply to join,{' '}
                        {!user ? <a href="/connect" rel="nofollow">log in.</a> : 'fill out the form below.'}
                    </p>}
                </div>

                {user && <>
                    <hr/>

                    <div className="content">
                        {success && <p className="has-text-weight-bold">
                            Thank you for submitting! You should hear back soon.
                        </p>}
                        {formState.isSubmitted && !success && !formState.isSubmitting &&
                         <div className="notification is-warning">
                            {alreadyApplied
                                ? 'This server has already been submitted before.'
                                : 'There is an error with your submission. Please correct it and re-submit.'}
                        </div>}
                        {!success && <form onSubmit={handleSubmit(onSubmit)} className="form">
                            <div className="field">
                                <label className="label" htmlFor="server">
                                    What is the name of the server that you would like to apply with?
                                </label>
                                <div className="control">
                                    <input name="server" type="text" className="input" list="servers"
                                        ref={register({required: 'This field is required'})}/>
                                    <datalist id="servers">
                                        {user && user.guilds && user.guilds.sort((g) => g.owner ? -1 : 1)
                                                                    .map((g) => <option key={g.id}>{g.name}</option>)}
                                    </datalist>
                                </div>
                                {errors.server && <p className="help is-danger">{errors.server.message}</p>}
                            </div>
                            <div className="field">
                                <label className="label" htmlFor="reason">
                                    Why do you think this server is a good fit in Discord Hotline?
                                </label>
                                <div className="control">
                                    <textarea name="reason" className="textarea"
                                        ref={register({
                                            required: 'This field is required', minLength: {
                                                value:   100,
                                                message: 'Must be at least 100 characters.',
                                            },
                                        })}/>
                                </div>
                                {errors.reason && <p className="help is-danger">{errors.reason.message}</p>}
                            </div>
                            <div className="field">
                                <label className="label" htmlFor="invite">
                                    Please supply a permanent invite for this server:
                                </label>
                                <div className="field has-addons">
                                    <p className="control">
                                        <a className="button is-static">
                                            https://discord.gg/
                                        </a>
                                    </p>
                                    <div className="control is-expanded">
                                        <input name="invite" type="text" className="input" autoComplete="off"
                                            ref={register({required: 'This field is required'})}/>
                                    </div>
                                </div>
                                {errors.invite && <p className="help is-danger">{errors.invite.message}</p>}
                            </div>

                            <br/>

                            <div className="field is-grouped is-pulled-right">
                                <div className="control">
                                    <button className="button is-link" disabled={formState.isSubmitting}
                                        onClick={handleSubmit(onSubmit)}>
                                        Submit
                                    </button>
                                </div>
                                <div className="control">
                                    <button type="reset" className="button is-text" onClick={reset}>
                                        Cancel
                                    </button>
                                </div>
                            </div>
                            <div className="is-clearfix"/>
                        </form>}
                    </div>
                </>}
            </div>
        </div>
    );
}
