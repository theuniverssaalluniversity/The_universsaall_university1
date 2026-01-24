import { useEffect, useState } from 'react';
import { supabase } from '../../../utils/supabase';
import { ShoppingBag, Clock } from 'lucide-react';

const StudentOrders = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from('orders')
                .select('*, order_items(*)')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (data) setOrders(data);
            setLoading(false);
        };
        fetchOrders();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'text-green-400 bg-green-400/10';
            case 'pending': return 'text-yellow-400 bg-yellow-400/10';
            case 'failed': return 'text-red-400 bg-red-400/10';
            default: return 'text-zinc-400 bg-zinc-400/10';
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-serif text-white flex items-center gap-3">
                <ShoppingBag className="text-primary" /> My Orders
            </h1>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2].map(i => <div key={i} className="h-24 bg-zinc-800/50 animate-pulse rounded-xl" />)}
                </div>
            ) : orders.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-zinc-800 rounded-xl">
                    <p className="text-zinc-500">No purchase history found.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div key={order.id} className="bg-zinc-900 border border-white/5 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="font-mono text-zinc-400 text-sm">#{order.short_id || order.id.slice(0, 8)}</span>
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </span>
                                </div>
                                <div className="text-white font-medium">
                                    {order.order_items?.length || 0} Items • ${order.total_amount}
                                </div>
                                <div className="text-sm text-zinc-500 mt-1 flex items-center gap-2">
                                    <Clock size={14} />
                                    {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
                                </div>
                            </div>
                            <button className="px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-colors text-sm">
                                View Details
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudentOrders;
