import { useState } from 'react';
import { Send, User, Search } from 'lucide-react';

const SupportChat = () => {
    const [selectedChat, setSelectedChat] = useState<number | null>(null);

    // Mock data for now
    const chats = [
        { id: 1, user: 'John Doe', lastMsg: 'I cannot access my course', time: '2m ago', unread: true },
        { id: 2, user: 'Jane Smith', lastMsg: 'Refund request for order #123', time: '1h ago', unread: false },
        { id: 3, user: 'Mike Ross', lastMsg: 'Thanks for the help!', time: '1d ago', unread: false },
    ];

    return (
        <div className="h-[calc(100vh-8rem)] flex gap-6">
            {/* Sidebar List */}
            <div className="w-80 flex flex-col bg-zinc-900 border border-white/5 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-white/5">
                    <h2 className="text-lg font-medium text-white mb-4">Inbox</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search chats..."
                            className="w-full bg-black border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {chats.map(chat => (
                        <div
                            key={chat.id}
                            onClick={() => setSelectedChat(chat.id)}
                            className={`p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${selectedChat === chat.id ? 'bg-white/5' : ''}`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className={`font-medium ${chat.unread ? 'text-white' : 'text-zinc-400'}`}>{chat.user}</span>
                                <span className="text-xs text-zinc-600">{chat.time}</span>
                            </div>
                            <p className={`text-sm truncate ${chat.unread ? 'text-zinc-300' : 'text-zinc-600'}`}>{chat.lastMsg}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 bg-zinc-900 border border-white/5 rounded-xl flex flex-col overflow-hidden">
                {selectedChat ? (
                    <>
                        {/* Header */}
                        <div className="h-16 border-b border-white/5 flex items-center px-6 gap-3">
                            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                                <User size={20} className="text-zinc-400" />
                            </div>
                            <div>
                                <div className="text-white font-medium">John Doe</div>
                                <div className="text-xs text-green-500">Online</div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                            <div className="flex justify-start">
                                <div className="bg-zinc-800 text-zinc-200 px-4 py-2 rounded-2xl rounded-tl-sm max-w-[80%]">
                                    Hi, I purchased the Astrology 101 course but it's not showing up in my dashboard.
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <div className="bg-primary text-black px-4 py-2 rounded-2xl rounded-tr-sm max-w-[80%] font-medium">
                                    Hello! Let me check that for you right away. Can you confirm your email address?
                                </div>
                            </div>
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-white/5">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Type your reply..."
                                    className="flex-1 bg-black border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
                                />
                                <button className="bg-primary text-black px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                                    <Send size={20} />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-zinc-500">
                        <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                            <User size={32} />
                        </div>
                        <p>Select a chat to start messaging</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SupportChat;
