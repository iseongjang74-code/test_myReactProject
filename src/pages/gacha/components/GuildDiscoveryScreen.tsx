import React, { useState } from 'react';
import { Guild } from '../types';

interface GuildDiscoveryScreenProps {
    guilds: Guild[];
    onCreateGuild: (guildName: string) => void;
    onJoinGuild: (guildId: string) => void;
}

const GuildDiscoveryScreen: React.FC<GuildDiscoveryScreenProps> = ({ guilds, onCreateGuild, onJoinGuild }) => {
    const [newGuildName, setNewGuildName] = useState('');

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (newGuildName.trim()) {
            onCreateGuild(newGuildName.trim());
            setNewGuildName('');
        }
    };

    return (
        <div className="space-y-6">
            <header className="text-center">
                <h1 className="text-3xl font-bold text-cyan-300">길드 찾기</h1>
                <p className="text-gray-400">동료들과 함께하기 위한 여정을 시작하세요.</p>
            </header>

            <section className="p-4 bg-gray-800/50 rounded-lg">
                <h2 className="text-xl font-semibold mb-3">길드 생성</h2>
                <form onSubmit={handleCreate} className="flex gap-2">
                    <input
                        type="text"
                        value={newGuildName}
                        onChange={(e) => setNewGuildName(e.target.value)}
                        placeholder="새 길드 이름"
                        className="flex-grow px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:border-cyan-500"
                        maxLength={20}
                    />
                    <button type="submit" disabled={!newGuildName.trim()} className="px-4 py-2 bg-indigo-600 font-semibold rounded-md hover:bg-indigo-500 disabled:opacity-50">
                        생성
                    </button>
                </form>
            </section>

            <section>
                <h2 className="text-xl font-semibold mb-3">길드 목록</h2>
                <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
                    {guilds.length > 0 ? guilds.map(guild => (
                        <div key={guild.id} className="p-3 bg-gray-800 rounded-lg flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-lg">{guild.name}</h3>
                                <p className="text-xs text-gray-400">길드장: {guild.creator} | 멤버: {guild.members.length}명</p>
                            </div>
                            <button onClick={() => onJoinGuild(guild.id)} className="px-4 py-2 bg-cyan-600 font-semibold rounded-md hover:bg-cyan-500">
                                가입
                            </button>
                        </div>
                    )) : (
                        <p className="text-center text-gray-500">생성된 길드가 없습니다. 첫 길드를 만들어 보세요!</p>
                    )}
                </div>
            </section>
        </div>
    );
};

export default GuildDiscoveryScreen;