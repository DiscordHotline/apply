const {parse}       = require('querystring');
const {Hook}        = require('hookcord');
const request       = require('request');
const {Entities}    = require('@hotline/application-plugin');
const erisEndpoints = require('eris/lib/rest/Endpoints')

const isValidInvite = require('../util/isValidInvite');
const database      = require('../util/database');
const auth          = require('../middleware/authentication');

const hook = new Hook();
hook.setOptions({link: process.secrets.apply.webhook_url + '?wait=true'});

// TODO: Move this to vault
const applicantRole  = '531713467619475456'
const memberRole     = '531617261077790720'
const hotlineGuildId = '204100839806205953'

const manageMemberRole = async (memberId, roleId, addRole = true) => {
    return eris.requestHandler.request(addRole ? 'PUT' : 'DELETE', erisEndpoints.GUILD_MEMBER_ROLE(hotlineGuildId, memberId, roleId), true)
}

const welcomeMember = async (user, guildRole) => {
    const created = user.id / 4194304 + 1420070400000;
    const role = `<@&${guildRole}>`;
    const message = {
        content: `Welcome <@${user.id}>, from ${role}!`,
        embed:   {
            title:     `New User: ${user.username}#${user.discriminator}`,
            fields:    [
                {name: '**ID:**', value: user.id},
                {name: '**Created On:**', value: new Date(created).toISOString()},
            ],
            thumbnail: {
                url:
                    user.avatar
                    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
                    : `https://discordapp.com/assets/6debd47ed13483642cf09e832ed0bc1b.png`,
            },
        },
    };
    await eris.createMessage(
        process.secrets.apply.welcome_channel,
        message,
    );
}

const addUserToGuild = (user, roles, applicant = false) => new Promise((resolve, reject) => {
    const hotlineGuildId = process.secrets.discord.guild_id;
    const body           = {access_token: user.accessToken};
    if (roles) {
        body.roles = roles;
    }

    console.log(`Adding ${user.id} to ${hotlineGuildId} with roles: ${JSON.stringify(body.roles)}`);
    request(
        {
            url:     `https://discordapp.com/api/v6/guilds/${hotlineGuildId}/members/${user.id}`,
            method:  'PUT',
            body:    JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json',
                Authorization:  eris.token,
            },
        },
        async (err, resp) => {
            console.log('Response from GUILD_MEMBER_ADD: ', resp);
            if (err) {
                return reject(err);
            }

            try {
                const promises = roles.map((role) => eris.addGuildMemberRole(hotlineGuildId, user.id, role));

                await Promise.all(promises);
            } catch (e) {
                console.log('Failed adding roles to user: ', e);
            }
            if (!applicant) {
                try {
                    // Remove applicant role, if its there.
                    await eris.removeGuildMemberRole(hotlineGuildId, user.id, applicantRole);
                } finally {
                    const guildRole = roles[roles.length - 1]

                    if (guildRole !== applicantRole) {
                        await welcomeMember(user, guildRole)
                    }
                }
            }

            resolve();
        },
    );
});

module.exports = (app) => app
    .get('/', async (req, res) => {
        res.render('index', {user: req.user, form: {}, errors: {}});
    })
    .get('/favicon.ico', (req, res) => res.sendStatus(404))
    .get('/:code', auth(), async (req, res) => {
        const invite = await database.getInvite(req.params.code);
        if (!invite || invite.revoked) {
            return res.render('join', {user: req.user, invalid: true});
        }

        res.render('join', {user: req.user, guild: invite.guild, invalid: false});
    })
    .post('/:code', auth(), async (req, res) => {
        const invite = await database.getInvite(req.params.code);
        if (!invite || invite.revoked) {
            return res.status(404).send('Unknown invite code');
        } if (invite.uses >= invite.maxUses) {
            return res.status(410).send('This invite has ran out of uses');
        } if (invite.expiresAt && (Date.now() > invite.expiresAt)) {
            return res.status(410).send('Invite has expired')
        }

        const guild = invite.guild;
        guild.members.push(req.user.id);
        guild.members = [...new Set(guild.members)];
        await guild.save();

        // Increment use count
        invite.uses++;
        invite.useMetadata.push({user: req.user.id, usedAt: new Date()});
        await invite.save();

        // Check if user is already in hotline
        let existingMember
        try {
            existingMember = await eris.getRESTGuildMember(hotlineGuildId, req.user.id)
        } catch (_) {}

        if (existingMember) {
            // Check if member doesn't have the member role
            if (!existingMember.roles.includes(memberRole)) {
                await manageMemberRole(req.user.id, memberRole, true)
            }

            // Check if member has applicant role
            if (existingMember.roles.includes(applicantRole)) {
                await manageMemberRole(req.user.id, applicantRole, false)
                await welcomeMember(req.user, guild.roleId)
            }

            // Check if member only doesn't have the guild role
            if (!existingMember.roles.includes(guild.roleId)) {
                await manageMemberRole(req.user.id, guild.roleId, true)
                console.log(`Skipped adding ${req.user.id} from ${guild.id} and only added the guild role.`)
            }
            
            return res.render('join', {user: req.user, join: true})
        }

        // Add the Member Role
        let roles = ['531617261077790720'];
        if (guild && guild.roleId) {
            roles.push(guild.roleId);
        }
        roles = [...new Set(roles)];

        try {
            await addUserToGuild(req.user, roles);
            res.render('join', {user: req.user, join: true});
        } catch (e) {
            console.error(e);
            res.render('join', {user: req.user, join: false});
        }

    })
    .post('/', auth(), async (req, res) => {
        const form   = parse(req.body.toString());
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
        let guild;

        try {
            const invite = await eris.getInvite(form.invite.replace(/https:\/\/discord\.gg\//, ''));

            serverId = invite.guild.id;
            guild    = await database.getGuild(serverId);
            if (guild && guild.application) {
                return res.render('index', {user: req.user, submitted: true, success: false, alreadyApplied: true});
            }
        } catch (e) {
            console.error(e);
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
            application.requestUser       = req.user.id;
            application.reason            = form.reason;
            application.inviteCode        = form.invite;
            application.votes             = {};
            application.insertDate        = new Date();
            application.guild             = guild.id;
            await application.save();
            // Add user to the Hotline guild as an Applicant (role id below)
            try {
                await addUserToGuild(req.user, [applicantRole]);
            } finally {
                res.render('index', {user: req.user, submitted: true, success: true});
            }
        } catch (e) {
            console.log(e);
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
