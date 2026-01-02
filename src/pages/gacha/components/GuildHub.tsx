import React, { useState, useRef, useEffect } from 'react';
import { Guild, PlayerState } from '../types';
import { SendIcon } from './icons';

interface GuildHubProps {
    guild: Guild;
    currentUser: string;
    playerState: PlayerState;
    onLeaveGuild: () => void;
    onSendMessage: (message: string) => void;
    onAttackRaid: () => void;
}

const GuildHub: React.FC<GuildHubProps> = ({ guild, currentUser, playerState, onLeaveGuild, onSendMessage, onAttackRaid }) => {
    const [chatMessage, setChatMessage] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [guild.chat]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (chatMessage.trim()) {
            onSendMessage(chatMessage.trim());
            setChatMessage('');
        }
    };
    
    const raidHpPercentage = (guild.raidBoss.hp / guild.raidBoss.maxHp) * 100;

    return (
        <div className="space-y-6">
            <header className="text-center relative">
                <h1 className="text-3xl font-bold text-cyan-300">{guild.name}</h1>
                <p className="text-gray-400">길드장: {guild.creator}</p>
                <button onClick={onLeaveGuild} className="absolute top-0 right-0 text-sm bg-red-600 px-3 py-1 rounded-md hover:bg-red-500">길드 탈퇴</button>
            </header>

            {/* Guild Raid */}
            <section className="p-4 bg-gray-800/50 rounded-lg">
                 <h2 className="text-xl font-semibold mb-3 text-center text-red-400">길드 레이드</h2>
                 <div className="text-center">
                     <img src={guild.raidBoss.imageUrl} alt={guild.raidBoss.name} className="w-48 h-48 mx-auto rounded-lg object-cover border-4 border-red-800" />
                     <h3 className="text-2xl font-bold mt-2">{guild.raidBoss.name}</h3>
                     <p className="text-sm text-gray-400">최근 공격자: {guild.raidBoss.lastAttackedBy || '없음'}</p>

                     <div className="w-full bg-gray-700 rounded-full h-6 mt-4 relative overflow-hidden border-2 border-black/50">
                        <div className="bg-red-600 h-full transition-all duration-500" style={{ width: `${raidHpPercentage}%` }}></div>
                        <span className="absolute inset-0 text-center text-sm font-bold text-white flex items-center justify-center">
                            {guild.raidBoss.hp.toLocaleString()} / {guild.raidBoss.maxHp.toLocaleString()}
                        </span>
                    </div>
                     <button 
                        onClick={onAttackRaid} 
                        disabled={guild.raidBoss.hp <= 0}
                        className="mt-4 px-8 py-3 rounded-lg bg-gradient-to-r from-red-600 to-orange-500 text-white font-bold text-lg shadow-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                        {guild.raidBoss.hp > 0 ? '공격!' : '보스 처치 완료'}
                     </button>
                 </div>
            </section>
            
            {/* Guild Chat & Members */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 p-4 bg-gray-800/50 rounded-lg flex flex-col">
                    <h2 className="text-xl font-semibold mb-3">길드 채팅</h2>
                    <div className="flex-grow bg-gray-900/50 p-2 rounded-md h-64 overflow-y-auto">
                         {guild.chat.map((msg, index) => (
                            <div key={index} className="mb-2 text-sm">
                                {msg.username === 'System' ? (
                                    <p className="text-cyan-400 italic">-- {msg.message} --</p>
                                ) : (
                                    <p><span className="font-semibold" style={{ color: msg.username === currentUser ? '#FBBF24' : 'white' }}>{msg.username}:</span> {msg.message}</p>
                                )}
                            </div>
                        ))}
                        <div ref={chatEndRef} />
                    </div>
                    <form onSubmit={handleSend} className="flex gap-2 mt-3">
                        <input
                            type="text"
                            value={chatMessage}
                            onChange={e => setChatMessage(e.target.value)}
                            placeholder="메시지 입력..."
                            className="flex-grow px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:border-cyan-500"
                        />
                        <button type="submit" className="p-2 bg-cyan-600 rounded-md hover:bg-cyan-500">
                            <SendIcon className="w-6 h-6" />
                        </button>
                    </form>
                </div>
                <div className="p-4 bg-gray-800/50 rounded-lg">
                    <h2 className="text-xl font-semibold mb-3">길드원 ({guild.members.length})</h2>
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                        {guild.members.map(member => (
                            <div key={member.username} className="p-2 bg-gray-700/50 rounded">
                                <p className="font-semibold">{member.username}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GuildHub;