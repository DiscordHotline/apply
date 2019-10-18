import {createError} from 'micro';
import fetch from 'node-fetch';
import useEris from '../hooks/useEris';
import useSecret from '../hooks/useSecret';
import welcomeMember from './welcomeMember';

interface Body {
    access_token: string;
    roles?: string[];
}

const applicantRole  = '531713467619475456';
const hotlineGuildId = '204100839806205953';


export default async function addUserToGuild(user: any, roles: string[], applicant: boolean = false) {
    const eris = await useEris();
    const [secret] = await useSecret<{ token: string }>('hotline/discord');

    const body: Body = {access_token: user.token.access_token};
    if (roles) {
        body.roles = roles;
    }

    console.log(`Adding ${user.id} to ${hotlineGuildId} with roles: ${JSON.stringify(body.roles)}`);

    try {
        const reqOptions = {
            method:  'PUT',
            body:    JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bot ' + secret.token,
            },
        }

        console.log(reqOptions)
        const response = await fetch(`https://discordapp.com/api/v6/guilds/${hotlineGuildId}/members/${user.id}`, reqOptions);

        if (!response.ok) {
            throw {response};
        }

        if (!applicant && !roles.includes(applicantRole)) {
            console.log('Trying to welcome the new member')
            const guildRole = roles[roles.length - 1];
    
            if (guildRole !== applicantRole) {
                console.log('Welcoming new member')
                await welcomeMember(user, guildRole)
            }
        }

        return await response.json();
    } catch (err) {
        console.error(err)
        const resp = err.response;
        console.log(
            'Response from GUILD_MEMBER_ADD: ',
            {body, statusCode: resp.status, statusMessage: resp.statusText, respBody: resp.body},
        );
        if (err || ![201, 204].includes(resp.statusCode)) {
            throw createError(
                resp ? resp.statusCode : 500,
                resp ? resp.statusMessage : 'Error adding member',
                err,
            );
        }
    }
}
