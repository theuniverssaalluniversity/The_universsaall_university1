import { useEffect, useState } from 'react';
import { supabase } from '../../../utils/supabase';
import { Link } from 'react-router-dom';
import { MessageSquare, Plus, Clock, ExternalLink } from 'lucide-react';

const TicketListPage = () => {
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from('support_tickets')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (data) setTickets(data);
        setLoading(false);
    };

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
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-serif text-white flex items-center gap-3">
                    <MessageSquare className="text-primary" /> Support Tickets
                </h1>
                <Link to="new" className="flex items-center gap-2 px-4 py-2 bg-primary text-black rounded-lg font-medium hover:bg-primary/90 transition-colors">
                    <Plus size={18} /> New Ticket
                </Link>
            </div>

            {loading ? (
                <div className="text-center py-8 text-zinc-500">Loading tickets...</div>
            ) : tickets.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-zinc-800 rounded-xl">
                    <p className="text-zinc-500 mb-4">No support tickets found.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {tickets.map((ticket) => (
                        <div key={ticket.id} className="bg-zinc-900 border border-white/5 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium border uppercase ${getStatusColor(ticket.status)}`}>
                                        {ticket.status}
                                    </span>
                                    <span className="text-zinc-500 text-xs uppercase">{ticket.priority} Priority</span>
                                </div>
                                <h3 className="text-white font-medium text-lg">{ticket.subject}</h3>
                                <div className="text-sm text-zinc-500 mt-1 flex items-center gap-2">
                                    <Clock size={14} /> Created {new Date(ticket.created_at).toLocaleDateString()}
                                </div>
                            </div>
                            <button className="text-primary text-sm font-medium flex items-center gap-1 hover:underline">
                                View Thread <ExternalLink size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TicketListPage;
