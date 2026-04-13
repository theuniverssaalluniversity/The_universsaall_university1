import { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabase';
import { format } from 'date-fns';
import { CheckCircle, Clock, XCircle, Package } from 'lucide-react';

interface Order {
    id: string;
    created_at: string;
    status: 'pending' | 'fulfilled' | 'cancelled';
    user_id: string;
    users: { full_name: string; email: string };
    order_items: {
        item_type: string;
        // Price excluded for Dispatch View
    }[];
}

const SupportOrders = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'fulfilled'>('all');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('orders')
            .select(`
                id,
                created_at,
                status,
                user_id,
                users (full_name, email),
                order_items (item_type)
            `)
            .order('created_at', { ascending: false });

        if (error) console.error(error);
        if (data) setOrders(data as any);
        setLoading(false);
    };

    const updateStatus = async (orderId: string, newStatus: string) => {
        const { error } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', orderId);

        if (!error) {
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus as any } : o));
        } else {
            console.error(error);
            alert('Failed to update status');
        }
    };

    const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);

    return (
        <div className="p-8">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-serif text-white mb-2">Dispatch & Fulfillment</h1>
                    <p className="text-zinc-400">Track and fulfill customer orders</p>
                </div>
            </header>

            {/* Filters */}
            <div className="flex gap-4 mb-8">
                {(['all', 'pending', 'fulfilled'] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${filter === f
                            ? 'bg-primary text-black'
                            : 'bg-zinc-800 text-zinc-400 hover:text-white'
                            }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-zinc-900 border border-white/5 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-zinc-800/50 text-zinc-400 uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4">Order ID</th>
                            <th className="px-6 py-4">Customer</th>
                            <th className="px-6 py-4">Items (Dispatch List)</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Fulfillment Status</th>
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr><td colSpan={6} className="px-6 py-8 text-center text-zinc-500">Loading orders...</td></tr>
                        ) : filteredOrders.length === 0 ? (
                            <tr><td colSpan={6} className="px-6 py-8 text-center text-zinc-500">No orders found.</td></tr>
                        ) : (
                            filteredOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-mono text-sm text-zinc-400">
                                        #{order.id.slice(0, 8)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-white font-medium">{order.users?.full_name || 'Guest'}</div>
                                        <div className="text-xs text-zinc-500">{order.users?.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            {/* Summary of types */}
                                            {Array.from(new Set(order.order_items.map(i => i.item_type))).map(type => (
                                                <span key={type} className="text-xs bg-zinc-800 px-2 py-0.5 rounded w-fit capitalize text-zinc-300 flex items-center gap-1">
                                                    <Package size={10} />
                                                    {type}
                                                </span>
                                            ))}
                                            <span className="text-xs text-zinc-500">{order.order_items.length} items</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-zinc-400">
                                        {format(new Date(order.created_at), 'MMM d, yyyy')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${order.status === 'fulfilled'
                                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                            : order.status === 'pending'
                                                ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                                : 'bg-red-500/10 text-red-400 border-red-500/20'
                                            }`}>
                                            {order.status === 'fulfilled' && <CheckCircle size={12} />}
                                            {order.status === 'pending' && <Clock size={12} />}
                                            {order.status === 'cancelled' && <XCircle size={12} />}
                                            <span className="capitalize">{order.status}</span>
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={order.status}
                                            onChange={(e) => updateStatus(order.id, e.target.value)}
                                            className="bg-black/50 border border-white/10 rounded px-2 py-1 text-xs text-white focus:border-primary outline-none"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="fulfilled">Fulfilled</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SupportOrders;
