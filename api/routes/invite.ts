import {NowRequest, NowResponse} from '@now/node';
import withErrors from '../hocs/withErrors';

import useAuthentication from '../hooks/useAuthentication';
import useDatabase from '../hooks/useDatabase';
import useEris from '../hooks/useEris';
import addUserToGuild from '../util/addUserToGuild';
import manageMemberRole from '../util/manageMemberRole';
import welcomeMember from '../util/welcomeMember';

// Grab from vault
const applicantRole  = '531713467619475456';
const memberRole     = '531617261077790720';
const hotlineGuildId = '204100839806205953';

export default withErrors(async (req: NowRequest, res: NowResponse) => {
    const [user]      = await useAuthentication(req, res, true);
    const {getInvite} = await useDatabase();
    const eris        = await useEris();

    const invite = await getInvite(req.query.code);
    if (!invite || invite.revoked) {
        return res.status(404).json({errorReason: 'Unknown invite code', success: false});
    }
    if (invite.uses >= invite.maxUses) {
        return res.status(410).json({errorReason: 'This invite has ran out of uses', success: false});
    }
    if (invite.expiresAt && (Date.now() > invite.expiresAt.getTime())) {
        return res.status(410).json({errorReason: 'Invite has expired', success: false});
    }

    const guild = invite.guild;
    guild.members.push(user.id);
    guild.members = [...new Set(guild.members)];
    await guild.save();

    // Add join attempt to invite
    invite.useMetadata.push({user: user.id, usedAt: new Date()});
    await invite.save();

    // Check if user is already in hotline
    let existingMember;
    try {
        existingMember = await eris.getRESTGuildMember(hotlineGuildId, user.id);
    } catch (_) {}

    if (existingMember) {
        // Check if member doesn't have the member role
        if (!existingMember.roles.includes(memberRole)) {
            await manageMemberRole(user.id, memberRole, true);
        }

        // Check if member has applicant role
        if (existingMember.roles.includes(applicantRole)) {
            await manageMemberRole(user.id, applicantRole, false);
            await welcomeMember(user, guild.roleId);
        }

        // Check if member only doesn't have the guild role
        if (!existingMember.roles.includes(guild.roleId)) {
            await manageMemberRole(user.id, guild.roleId, true);
            console.log(`Skipped adding ${user.id} from ${guild.id} and only added the guild role.`);
        }

        invite.uses++;
        await invite.save();

        return res.status(200).json({success: true});
    }

    // Add the Member Role
    let roles = ['531617261077790720'];
    if (guild && guild.roleId) {
        roles.push(guild.roleId);
    }
    roles = [...new Set(roles)];

    try {
        await addUserToGuild(user, roles);
        invite.uses++;
        await invite.save();

        return res.status(200).json({success: true});
    } catch (e) {
        let errorReason;
        switch (e.code) {
            case 30001: {
                errorReason = 'Maximum number of guilds reached (100)';
                console.log(`${user} attempted to join Hotline while being at their guild limit`);
                break;
            }

            case 50025: {
                errorReason = 'Relog and try again';
                console.log(`${user} attempted to join Hotline while their access token is invalid`);
                break;
            }
        }

        return res.status(400).json({errorReason, success: false});
    }

});
