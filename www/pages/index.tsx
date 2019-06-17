import {useContext, useState} from 'react';
import {AuthContext} from '../hooks/useAuthContext';

interface Form {
    server?: string;
    reason?: string;
    invite?: string;
}

export default () => {
    const user                                = useContext(AuthContext);
    const [submitted, setSubmitted]           = useState(false);
    const [success, setSuccess]               = useState(false);
    const [alreadyApplied, setAlreadyApplied] = useState(false);
    const [errors, setErrors]                 = useState<Form>({});

    const [form, setForm] = useState<Form>({});

    const submit = async () => {

    };

    console.log({user});

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
                        Discord Hotline is a networking community of moderators. It's a place
                        where you can go to ask questions about other servers' moderation. We also
                        have an early warning system for problematic users and raids.
                    </p>

                    {!submitted && <p>
                        If you would like to apply to join,{' '}
                        {!user ? <a href="/connect" rel="nofollow">log in.</a> : 'fill out the form below.'}
                    </p>}
                </div>

                {user && <>
                    <hr/>

                    <div className="content">
                        {submitted && success && <p className="has-text-weight-bold">
                            Thank you for submitting! You should hear back soon.
                        </p>}
                        {submitted && !success && <div className="notification is-warning">
                            {alreadyApplied
                                ? 'This server has already been submitted before.'
                                : 'There is an error with your submission. Please correct it and re-submit.'}
                        </div>}
                        <form action="/" method="post">
                            <div className="field">
                                <label className="label" htmlFor="server">
                                    What is the name of the server that you would like to apply with?
                                </label>
                                <div className="control">
                                    <input type="text" className={`input${errors.server ? ' is-danger' : ''}`}
                                        name="server" value={form.server} list="servers"
                                        onChange={(e) => setForm({...form, server: e.target.value})}/>
                                    <datalist id="servers">
                                        {user.guilds.sort((g) => g.owner ? -1 : 1)
                                             .map((g) => <option key={g.id}>{g.name}</option>)}
                                    </datalist>
                                </div>
                                {errors.server && <p className="help is-danger">{errors.server}</p>}
                            </div>
                            <div className="field">
                                <label className="label" htmlFor="reason">
                                    Why do you think this server is a good fit in Discord Hotline?
                                </label>
                                <div className="control">
                                    <textarea name="reason" className={`textarea${errors.reason ? ' is-danger' : ''}`}
                                        onChange={(e) => setForm({...form, reason: e.target.value})}>
                                        {form.reason}
                                    </textarea>
                                </div>
                                {errors.reason && <p className="help is-danger">{errors.reason}</p>}
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
                                        <input type="text" className={`input${errors.invite ? ' is-danger' : ''}`}
                                            name="invite" value={form.invite} autoComplete="off"
                                            onChange={(e) => setForm({...form, invite: e.target.value})}/>
                                    </div>
                                </div>
                                {errors.invite && <p className="help is-danger">{errors.invite}</p>}
                            </div>

                            <br/>

                            <div className="field is-grouped is-pulled-right">
                                <div className="control">
                                    <button type="submit" className="button is-link" onClick={submit}>
                                        Submit
                                    </button>
                                </div>
                                <div className="control">
                                    <button type="reset" className="button is-text" onClick={() => setForm({})}>
                                        Cancel
                                    </button>
                                </div>
                            </div>
                            <div className="is-clearfix"/>
                        </form>
                    </div>
                </>}
            </div>
        </div>
    );
}
