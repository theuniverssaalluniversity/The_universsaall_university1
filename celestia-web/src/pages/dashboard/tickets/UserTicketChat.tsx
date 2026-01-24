import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../../utils/supabase';
import { ArrowLeft, Send, Clock, AlertCircle } from 'lucide-react';

const UserTicketChat = () => {
    const { ticketId } = useParams();
    const navigate = useNavigate();
    const [ticket, setTicket] = useState<any | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        if (ticketId) {
            fetchTicketDetails();
            const sub = subscribeToMessages();
            return () => { supabase.removeChannel(sub); };
        }
    }, [ticketId]);

    const fetchTicketDetails = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !ticketId) return;

        // 1. Fetch Ticket (Verify ownership)
        const { data: ticketData, error } = await supabase
            .from('support_tickets')
            .select('*')
            .eq('id', ticketId)
            .eq('user_id', user.id) // Security check
            .single();

        if (error || !ticketData) {
            alert('Ticket not found or access denied.');
            navigate(-1);
            return;
        }
        setTicket(ticketData);

        // 2. Fetch Messages
        const { data: msgs } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('ticket_id', ticketId)
            .order('created_at', { ascending: true });

        if (msgs) setMessages(msgs);
        setLoading(false);
    };

    const subscribeToMessages = () => {
        return supabase
            .channel(`ticket-${ticketId}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `ticket_id=eq.${ticketId}` }, (payload) => {
                setMessages(prev => [...prev, payload.new]);
            })
            .subscribe();
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !ticketId) return;
        setSending(true);

        const { data: { user } } = await supabase.auth.getUser();

        const { error } = await supabase
            .from('chat_messages')
            .insert({
                ticket_id: ticketId,
                sender_id: user?.id,
                message: newMessage.trim()
            });

        if (!error) {
            setNewMessage('');
            // If ticket was resolved, maybe reopen it? (Optional logic)
        } else {
            alert('Failed to send message');
        }
        setSending(false);
    };

    if (loading) return <div className="p-10 text-center text-zinc-500">Loading conversation...</div>;

    return (
        <div className="max-w-3xl mx-auto h-[calc(100vh-8rem)] flex flex-col bg-zinc-900 border border-white/5 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex items-center gap-4 bg-zinc-900/50">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-zinc-400 hover:text-white">
                    <ArrowLeft size={20} />
                </button>
                <div className="flex-1">
                    <h1 className="text-lg font-bold text-white flex items-center gap-3">
                        {ticket.subject}
                        <span className={`text-xs px-2 py-0.5 rounded uppercase border ${ticket.status === 'open' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                ticket.status === 'resolved' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                    'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                            }`}>
                            {ticket.status}
                        </span>
                    </h1>
                    <div className="text-xs text-zinc-500 flex items-center gap-2">
                        <Clock size={12} /> ID: {ticket.id}
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-black/20">
                {/* Original Request Block */}
                <div className="bg-zinc-800/40 border border-white/5 p-4 rounded-xl text-zinc-300 mx-auto w-full max-w-2xl">
                    <div className="text-xs text-zinc-500 font-bold uppercase mb-2">Original Request</div>
                    {ticket.message}
                </div>

                {/* Messages */}
                {messages.map((msg) => {
                    const isMe = msg.sender_id === ticket.user_id; // Logged in user is the ticket owner
                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-4 rounded-xl border ${isMe
                                    ? 'bg-primary/10 border-primary/20 text-white rounded-tr-none'
                                    : 'bg-zinc-800 border-white/5 text-zinc-200 rounded-tl-none'
                                }`}>
                                <div className="text-xs opacity-50 mb-1 flex justify-between items-center gap-4">
                                    <span>{isMe ? 'You' : 'Support Agent'}</span>
                                    <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <p className="whitespace-pre-wrap">{msg.message}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Input Area */}
            {ticket.status !== 'closed' ? (
                <div className="p-4 border-t border-white/5 bg-zinc-900">
                    <div className="flex gap-2 max-w-2xl mx-auto">
                        <input
                            type="text"
                            placeholder="Type a reply..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            className="flex-1 bg-black border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={sending || !newMessage.trim()}
                            className="bg-primary text-black px-4 rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            ) : (
                <div className="p-4 bg-zinc-900 text-center text-zinc-500 border-t border-white/5">
                    <div className="flex items-center justify-center gap-2">
                        <AlertCircle size={16} /> This ticket is closed. Please create a new ticket for further assistance.
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserTicketChat;
