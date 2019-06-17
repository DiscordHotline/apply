import useEris from '../hooks/useEris';
import useSecret from '../hooks/useSecret';

export default async function welcomeMember(user: any, guildRole: string) {
    const eris                = await useEris();
    const [{welcome_channel}] = await useSecret<{ welcome_channel: string }>('hotline/apply/discord');

    const created = user.id / 4194304 + 1420070400000;
    const role    = `<@&${guildRole}>`;
    const message = {
        content: `Welcome <@${user.id}>, from ${role}!`,
        embed:   {
            title:     `New User: ${user.username}#${user.discriminator}`,
            fields:    [
                {name: '**ID:**', value: user.id},
                {name: '**Created On:**', value: new Date(created).toISOString()},
            ],
            thumbnail: {
                url: user.avatar
                         ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
                         : `https://discordapp.com/assets/6debd47ed13483642cf09e832ed0bc1b.png`,
            },
        },
    };

    return eris.createMessage(welcome_channel, message);
}
