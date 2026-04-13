import { useEffect, useState } from 'react';
import { supabase } from '../../../utils/supabase';
import { Link } from 'react-router-dom';
import { MessageSquare, Plus, Clock, ExternalLink } from 'lucide-react';

const TicketListPage = () => {
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('all');

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: ticketsData } = await supabase
            .from('support_tickets')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (ticketsData) {
            // Check for last message
            const ticketsWithMeta = await Promise.all(ticketsData.map(async (t) => {
                const { data: msgs } = await supabase
                    .from('chat_messages')
                    .select('sender_id, message, created_at')
                    .eq('ticket_id', t.id)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();

                return {
                    ...t,
                    last_message: msgs
                };
            }));
            setTickets(ticketsWithMeta);
        }
        setLoading(false);
    };

    const filteredTickets = tickets.filter(ticket => {
        if (filter === 'all') return true;
        if (filter === 'open') return ticket.status !== 'closed'; // Active tickets
        if (filter === 'closed') return ticket.status === 'closed';
        return true;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'resolved': return 'bg-green-500/10 text-green-400 border-green-500/20';
            case 'closed': return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
            default: return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl font-serif text-white flex items-center gap-3">
                    <MessageSquare className="text-primary" /> Support Tickets
                </h1>
                <Link to="new" className="flex items-center gap-2 px-4 py-2 bg-primary text-black rounded-lg font-medium hover:bg-primary/90 transition-colors">
                    <Plus size={18} /> New Ticket
                </Link>
            </div>

            {/* Filters */}
            <div className="flex gap-2 border-b border-white/5 pb-1">
                {(['all', 'open', 'closed'] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors relative ${filter === f
                            ? 'text-primary border-b-2 border-primary bg-primary/5'
                            : 'text-zinc-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="text-center py-8 text-zinc-500">Loading tickets...</div>
            ) : filteredTickets.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-zinc-800 rounded-xl">
                    <p className="text-zinc-500 mb-4">
                        {filter === 'all' ? 'No support tickets found.' : `No ${filter} tickets found.`}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredTickets.map((ticket) => (
                        <div key={ticket.id} className="bg-zinc-900 border border-white/5 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-white/10 transition-colors">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium border uppercase ${getStatusColor(ticket.status)}`}>
                                        {ticket.status}
                                    </span>
                                    {ticket.last_message && ticket.last_message.sender_id !== ticket.user_id && (
                                        <span className="px-2 py-0.5 rounded-full bg-primary text-black text-xs font-bold animate-pulse">
                                            New Reply
                                        </span>
                                    )}
                                    <span className="text-zinc-500 text-xs uppercase">{ticket.priority} Priority</span>
                                </div>
                                <h3 className="text-white font-medium text-lg">{ticket.subject}</h3>
                                <div className="text-sm text-zinc-500 mt-1 flex items-center gap-2">
                                    <Clock size={14} /> Created {new Date(ticket.created_at).toLocaleDateString()}
                                </div>
                            </div>
                            <Link
                                to={`${ticket.id}`}
                                className="text-primary text-sm font-medium flex items-center gap-1 hover:underline"
                            >
                                View Thread <ExternalLink size={14} />
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TicketListPage;
