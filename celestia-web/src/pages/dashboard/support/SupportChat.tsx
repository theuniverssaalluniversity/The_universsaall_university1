import { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabase';
import { Send, User, Search, AlertCircle, CheckCircle } from 'lucide-react';

const SupportChat = () => {
    const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Chat state
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);

    useEffect(() => {
        fetchTickets();
    }, []);

    useEffect(() => {
        if (selectedTicket) {
            fetchMessages(selectedTicket.id);
        } else {
            setMessages([]);
        }
    }, [selectedTicket]);

    const fetchMessages = async (ticketId: string) => {
        const { data } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('ticket_id', ticketId)
            .order('created_at', { ascending: true });

        if (data) setMessages(data);
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedTicket) return;
        setSending(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
            .from('chat_messages')
            .insert({
                ticket_id: selectedTicket.id,
                sender_id: user.id,
                message: newMessage.trim()
            });

        if (!error) {
            setNewMessage('');
            fetchMessages(selectedTicket.id);
        } else {
            console.error('Error sending message:', error);
            alert('Failed to send message');
        }
        setSending(false);
    };

    const fetchTickets = async () => {
        setLoading(true);
        // Fetch tickets with user details
        const { data, error } = await supabase
            .from('support_tickets')
            .select(`
                *,
                users (
                    full_name,
                    email,
                    avatar_url
                )
            `)
            .order('created_at', { ascending: false });

        if (data) setTickets(data);
        if (error) console.error(error);
        setLoading(false);
    };

    const handleUpdateStatus = async (ticketId: string, newStatus: string) => {
        const { error } = await supabase
            .from('support_tickets')
            .update({ status: newStatus })
            .eq('id', ticketId);

        if (!error) {
            setTickets(tickets.map(t => t.id === ticketId ? { ...t, status: newStatus } : t));
            if (selectedTicket?.id === ticketId) {
                setSelectedTicket({ ...selectedTicket, status: newStatus });
            }
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': case 'high': return 'text-red-400';
            case 'medium': return 'text-yellow-400';
            default: return 'text-zinc-400';
        }
    };

    const filteredTickets = tickets.filter(t =>
        t.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.users?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="h-[calc(100vh-8rem)] flex gap-6">
            {/* Sidebar List */}
            <div className="w-80 flex flex-col bg-zinc-900 border border-white/5 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-white/5">
                    <h2 className="text-lg font-medium text-white mb-4">Ticket Inbox</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search tickets..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-black border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="p-4 text-center text-zinc-500">Loading...</div>
                    ) : filteredTickets.length === 0 ? (
                        <div className="p-4 text-center text-zinc-500">No tickets found.</div>
                    ) : (
                        filteredTickets.map(ticket => (
                            <div
                                key={ticket.id}
                                onClick={() => setSelectedTicket(ticket)}
                                className={`p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${selectedTicket?.id === ticket.id ? 'bg-white/5' : ''}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`font-medium text-white truncate max-w-[120px]`}>{ticket.users?.full_name || 'User'}</span>
                                    <span className="text-xs text-zinc-600 whitespace-nowrap">{new Date(ticket.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="mb-1">
                                    <span className={`text-xs uppercase font-bold ${getPriorityColor(ticket.priority)}`}>{ticket.priority}</span>
                                </div>
                                <p className="text-sm text-zinc-400 truncate">{ticket.subject}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Ticket Detail Area */}
            <div className="flex-1 bg-zinc-900 border border-white/5 rounded-xl flex flex-col overflow-hidden">
                {selectedTicket ? (
                    <>
                        {/* Header */}
                        <div className="h-20 border-b border-white/5 flex items-center justify-between px-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 overflow-hidden">
                                    {selectedTicket.users?.avatar_url ? (
                                        <img src={selectedTicket.users.avatar_url} className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={20} />
                                    )}
                                </div>
                                <div>
                                    <div className="text-white font-medium">{selectedTicket.users?.full_name}</div>
                                    <div className="text-xs text-zinc-500">{selectedTicket.users?.email}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase border ${selectedTicket.status === 'open' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                    selectedTicket.status === 'resolved' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                        'bg-zinc-800 text-zinc-400'
                                    }`}>
                                    {selectedTicket.status}
                                </span>
                                {selectedTicket.status !== 'resolved' && (
                                    <button
                                        onClick={() => handleUpdateStatus(selectedTicket.id, 'resolved')}
                                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition"
                                    >
                                        <CheckCircle size={16} /> Mark Resolved
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Ticket Content */}
                        <div className="flex-1 p-8 overflow-y-auto space-y-6 flex flex-col">
                            {/* Original Ticket Message */}
                            <div className="bg-zinc-800/50 border border-white/5 rounded-xl p-6 text-zinc-300 leading-relaxed whitespace-pre-wrap self-start max-w-[85%]">
                                <div className="text-xs text-zinc-500 mb-2 font-bold uppercase tracking-wider">Original Request</div>
                                {selectedTicket.message}
                            </div>

                            {/* Chat History */}
                            {messages.map((msg) => {
                                return (
                                    <div key={msg.id} className={`max-w-[80%] p-4 rounded-xl border ${msg.sender_id === selectedTicket.user_id
                                        ? 'bg-zinc-800/50 border-white/5 self-start'
                                        : 'bg-primary/10 border-primary/20 text-white self-end'
                                        }`}>
                                        <div className="text-xs opacity-50 mb-1">
                                            {new Date(msg.created_at).toLocaleString()}
                                        </div>
                                        {msg.message}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Reply Input (Visual only for now) */}
                        <div className="p-4 border-t border-white/5 bg-black/20">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Type a response..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                    className="flex-1 bg-black border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={sending || !newMessage.trim()}
                                    className="bg-primary text-black px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send size={20} />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-zinc-500">
                        <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                            <AlertCircle size={32} />
                        </div>
                        <p>Select a ticket to view details</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SupportChat;
