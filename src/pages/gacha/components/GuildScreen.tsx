import React from 'react';
import { PlayerState, Guild } from '../types';
import GuildDiscoveryScreen from './GuildDiscoveryScreen';
import GuildHub from './GuildHub';

interface GuildScreenProps {
    currentUser: string;
    playerState: PlayerState;
    allGuilds: Guild[];
    onCreateGuild: (guildName: string) => void;
    onJoinGuild: (guildId: string) => void;
    onLeaveGuild: () => void;
    onSendMessage: (message: string) => void;
    onAttackRaid: () => void;
}

const GuildScreen: React.FC<GuildScreenProps> = (props) => {
    const { playerState, allGuilds, currentUser } = props;
    const currentGuild = allGuilds.find(g => g.id === playerState.guildId);

    if (currentGuild) {
        return <GuildHub guild={currentGuild} currentUser={currentUser} {...props} />;
    } else {
        return <GuildDiscoveryScreen guilds={allGuilds} {...props} />;
    }
};

export default GuildScreen;