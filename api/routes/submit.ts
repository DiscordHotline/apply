import {Entities} from '@hotline/application-plugin';
import {NowRequest, NowResponse} from '@now/node';
import {createError, json} from 'micro';

import useAuthentication from '../hooks/useAuthentication';
import useDatabase from '../hooks/useDatabase';
import useEris from '../hooks/useEris';
import useHook from '../hooks/useHook';
import addUserToGuild from '../util/addUserToGuild';
import isValidInvite from '../util/isValidInvite';

interface Form {
    server?: string;
    reason?: string;
    invite?: string;
}

const applicantRole = '531713467619475456';

async function isValidForm(form) {
    const errors: Form = {};
    for (const name of Object.keys(form)) {
        const value = form[name];
        if (value.length === 0) {
            errors[name] = 'This field is required';
        }
    }

    if (!errors.invite && !await isValidInvite(form.invite)) {
        errors.invite = 'This invite is invalid. Must be a complete https://discord.gg link.';
    }

    return errors;
}

export default async (req: NowRequest, res: NowResponse) => {
    const [user]   = await useAuthentication(req, res);
    const eris     = await useEris();
    const form: Form = await json(req);

    const errors = await isValidForm(form);
    if (Object.keys(errors).length > 0) {
        return res.status(400).send({errors});
    }

    const {getGuild} = await useDatabase();

    let posted = false;
    let messageId;
    let serverId;
    let guild;

    try {
        const invite = await eris.getInvite(form.invite.replace(/https:\/\/discord\.gg\//, ''));

        serverId = invite.guild.id;
        guild    = await getGuild(serverId);
        if (guild && guild.application) {
            return res.status(409).json({alreadyApplied: true});
        }
    } catch (e) {
        throw createError(400, 'Error fetching invite.', e);
    }

    const hook = await useHook();

    try {
        const response = await hook.setPayload({
            username: 'New Application',
            embeds:   [
                {
                    title:       form.server,
                    type:        'rich',
                    description: form.reason,
                    fields:      [
                        {name: 'Invite Code', value: form.invite, inline: true},
                        {name: 'Requester', value: `<@${user.id}>`, inline: true},
                    ],
                    timestamp:   (
                                     new Date()
                                 ).toISOString(),
                },
            ],
        }).fire();
        messageId      = response.body.channel_id + ':' + response.body.id;
        await Promise.all([
            eris.addMessageReaction(response.body.channel_id, response.body.id, '✅'),
            eris.addMessageReaction(response.body.channel_id, response.body.id, '❌'),
        ]);

        posted = true;
    } catch (e) {
        console.error('Failed to post webhook', e);
    }

    try {
        if (!guild) {
            guild         = new Entities.Guild();
            guild.guildId = serverId;
            guild.members = [];
            guild.owners  = [];
            guild.name    = form.server;
            await guild.save();
        }

        const application             = new Entities.Application();
        application.posted            = posted;
        application.approvalMessageId = messageId;
        application.requestUser       = user.id;
        application.reason            = form.reason;
        application.inviteCode        = form.invite;
        application.votes             = {approvals: 0, denies: 0, entries: {}};
        application.insertDate        = new Date();
        application.guild             = guild.id;
        await application.save();
        // Add user to the Hotline guild as an Applicant (role id below)
        try {
            await addUserToGuild(user, [applicantRole]);
        } finally {
            return res.status(204).send(null);
        }
    } catch (e) {
        throw createError(500, 'Error submitting form', e);
    }
};
