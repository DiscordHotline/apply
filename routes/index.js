const base64Img = require('base64-img');
const {resolve} = require('path');
const {parse}   = require('querystring');
const {Hook}    = require('hookcord');
const request   = require('request');

const isValidInvite = require('../util/isValidInvite');
const database      = require('../util/database');
const auth          = require('../middleware/authentication');

const hook = new Hook();
hook.setOptions({link: process.secrets.apply.webhook_url + '?wait=true'});

module.exports = (app) => app
    .get('/', async (req, res) => {
        res.render('index', {user: req.user, form: {}, errors: {}});
    })
    .get('/favicon.ico', (req, res) => res.sendStatus(404))
    .get('/:code', auth('guilds.join'), async (req, res) => {
        const invite = await database.getInvite(req.params.code)
        const application = (invite && invite.applicationId) ? await database.getApplicationById(invite.applicationId) : null

        if ((!invite && !application) || invite.revoked === 1) {
            return res.status(404).send('Unknown invite code')
        }

        res.render('join', {user: req.user, application});
    })
    .post('/:code', auth('guilds.join'), async (req, res) => {
        const invite = await database.getInvite(req.params.code)
        const application = (invite && invite.applicationId) ? await database.getApplicationById(invite.applicationId) : null

        if (!invite || invite.revoked === 1) {
            return res.status(404).send('Unknown invite code')
        } if (invite.uses >= invite.maxUses) {
            return res.status(429).send('This invite has ran out of uses')
        }

        const guildId = process.secrets.discord.guild_id;
        let addMemberBody = {
            access_token: req.user.accessToken,
        }

        if (application) {
            addMemberBody.roles = [application.server_role_id]
        }

        invite.uses++
        invite.useMetadata.push({user: req.user.id, usedAt: new Date()})
        await database.query('UPDATE `applications`.`invites` SET `uses` = ?, `useMetadata` = ? WHERE `id` = ?', [invite.uses, JSON.stringify(invite.useMetadata), invite.id])

        request(
            {
                url:     `https://discordapp.com/api/v6/guilds/${guildId}/members/${req.user.id}`,
                method:  'PUT',
                body:    JSON.stringify(addMemberBody),
                headers: {
                    'Content-Type': 'application/json',
                    Authorization : eris.token
                },
            },
            async (err) => {
                res.render('join', {user: req.user, join: !err});
            },
        );
    })
    .post('/', auth(), async (req, res) => {
        const form = parse(req.body.toString());
        const errors = await isValidForm(form);
        if (Object.keys(errors).length > 0) {
            return res.render(
                'index',
                {
                    user:      req.user,
                    submitted: true,
                    success:   false,
                    errors,
                    form,
                },
            );
        }

        let posted = false;
        let messageId;
        let serverId;

        try {
            const invite = await eris.getInvite(form.invite.replace(/https:\/\/discord\.gg\//, ''))

            serverId = invite.guild.id;

            const existingApplication = await database.getApplicationByServerId(serverId)
            if (existingApplication) {
                return res.render('index', {user: req.user, submitted: true, success: false, alreadyApplied: true})
            }
        } catch (e) {
            console.error(e)
        }


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
                            {name: 'Requester', value: `<@${req.user.id}>`, inline: true},
                        ],
                        timestamp:   (
                                         new Date()
                                     ).toISOString(),
                    },
                ],
            }).fire();
            messageId      = response.body.channel_id + ':' + response.body.id;
            await Promise.all([
                app.eris.addMessageReaction(response.body.channel_id, response.body.id, '✅'),
                app.eris.addMessageReaction(response.body.channel_id, response.body.id, '❌'),
            ]);

            posted = true;
        } catch (e) {
            console.error('Failed to post webhook', e);
        }

        try {
            await database.query('INSERT INTO `applications` SET ?', {
                posted,
                approval_message_id: messageId,
                request_user       : req.user.id,
                server             : form.server,
                server_id          : serverId,
                reason             : form.reason,
                invite_code        : form.invite,
                votes              : JSON.stringify({}),
                insert_date        : new Date().toISOString().slice(0, 19).replace('T', ' '),
            });

            res.render('index', {user: req.user, submitted: true, success: true});
        } catch (e) {
            console.log(e)
            res.render('index', {user: req.user, submitted: true, success: false});
        }
    });

async function isValidForm(form) {
    const errors = {};
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
