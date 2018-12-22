const base64Img = require('base64-img');
const {resolve} = require('path');
const {parse}   = require('querystring');
const {Hook}    = require('hookcord');

const auth = require('../middleware/authentication');

const hook = new Hook();
hook.setOptions({link: process.secrets.apply.webhook_url + '?wait=true'});

const logo = base64Img.base64Sync(resolve(__dirname, '..', 'assets', 'logo.png'));

module.exports = (app) => app
    .get('/', async (req, res) => {
        res.render('index', {user: req.user, logo});
    })
    .post('/', auth(), async (req, res) => {
        const form = parse(req.body.toString());

        let posted = false;
        let messageId;
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

        app.database.query('INSERT INTO `applications` SET ?', {
            posted,
            approval_message_id: messageId,
            request_user:        req.user.id,
            server:              form.server,
            reason:              form.reason,
            invite_code:         form.invite,
            votes:               JSON.stringify({}),
            insert_date:         new Date().toISOString().slice(0, 19).replace('T', ' '),
        }, (err) => {
            res.render('index', {user: req.user, logo, submitted: true, success: !err});
        });
    });
