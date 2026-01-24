import { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabase';
import { Send, User, Search, AlertCircle, CheckCircle, Clock } from 'lucide-react';

const SupportChat = () => {
    const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchTickets();
    }, []);

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
                        <div className="flex-1 p-8 overflow-y-auto space-y-6">
                            <div>
                                <h3 className="text-2xl font-serif text-white mb-2">{selectedTicket.subject}</h3>
                                <div className="flex items-center gap-2 text-zinc-500 text-sm mb-6">
                                    <Clock size={16} />
                                    Submitted on {new Date(selectedTicket.created_at).toLocaleString()}
                                </div>
                                <div className="bg-black/30 border border-white/5 rounded-xl p-6 text-zinc-300 leading-relaxed whitespace-pre-wrap">
                                    {selectedTicket.message}
                                </div>
                            </div>

                            {/* Placeholder for reply history if implemented later */}
                            <div className="flex items-center gap-2 text-zinc-500 text-sm">
                                <AlertCircle size={16} />
                                <span>Replies are currently handled via email notification system.</span>
                            </div>
                        </div>

                        {/* Reply Input (Visual only for now) */}
                        <div className="p-4 border-t border-white/5 bg-black/20">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Type an internal note or reply..."
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
