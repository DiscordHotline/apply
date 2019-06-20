import * as erisEndpoints from 'eris/lib/rest/Endpoints';
import useEris from '../hooks/useEris';

const hotlineGuildId = '204100839806205953';

const manageMemberRole = async (memberId, roleId, addRole = true) => {
    const eris: any = await useEris();

    return eris.requestHandler.request(
        addRole ? 'PUT' : 'DELETE',
        erisEndpoints.GUILD_MEMBER_ROLE(hotlineGuildId, memberId, roleId),
        true,
    );
};

export default manageMemberRole;
