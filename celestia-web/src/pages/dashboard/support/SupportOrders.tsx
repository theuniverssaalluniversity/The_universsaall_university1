import { useEffect, useState } from 'react';
import { supabase } from '../../../utils/supabase';
import { Search, CheckCircle, XCircle, Clock } from 'lucide-react';

const SupportOrders = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('orders')
            .select('*, users(email, full_name, id)')
            .order('created_at', { ascending: false });

        if (data) setOrders(data);
        if (error) console.error(error);
        setLoading(false);
    };

    const updateStatus = async (orderId: string, newStatus: string) => {
        const { error } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', orderId);

        if (!error) {
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        }
    };

    const filteredOrders = orders.filter(o => {
        const matchesSearch = o.id.includes(searchTerm) || o.users?.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'all' || o.status === filter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-serif text-white">Order Management</h1>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search by Order ID or Email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-zinc-900 border border-white/10 rounded-lg text-white w-full focus:outline-none focus:border-primary"
                    />
                </div>
                <div className="flex items-center gap-2 bg-zinc-900 border border-white/10 rounded-lg p-1">
                    {['all', 'completed', 'pending', 'failed'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-md text-sm capitalize transition-colors ${filter === f ? 'bg-white/10 text-white font-medium' : 'text-zinc-400 hover:text-white'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-zinc-900 border border-white/5 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-zinc-400 text-sm font-medium">
                        <tr>
                            <th className="px-6 py-4">Order Details</th>
                            <th className="px-6 py-4">Customer</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr><td colSpan={5} className="px-6 py-8 text-center text-zinc-500">Loading...</td></tr>
                        ) : filteredOrders.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-8 text-center text-zinc-500">No orders found.</td></tr>
                        ) : (
                            filteredOrders.map((order) => (
                                <tr key={order.id || Math.random()} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-mono text-sm text-zinc-300">#{order.short_id || (order.id ? order.id.slice(0, 8) : '???')}</div>
                                        <div className="text-xs text-zinc-500">{order.created_at ? new Date(order.created_at).toLocaleString() : '-'}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-white">{order.users?.full_name || 'Guest'}</div>
                                        <div className="text-sm text-zinc-500">{order.users?.email || 'No Email'}</div>
                                    </td>
                                    <td className="px-6 py-4 text-white font-medium">
                                        ${order.total_amount}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${order.status === 'completed' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                            order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                                'bg-red-500/10 text-red-400 border-red-500/20'
                                            }`}>
                                            {order.status === 'completed' && <CheckCircle size={12} />}
                                            {order.status === 'pending' && <Clock size={12} />}
                                            {order.status === 'failed' && <XCircle size={12} />}
                                            <span className="capitalize">{order.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={order.status}
                                            onChange={(e) => updateStatus(order.id, e.target.value)}
                                            className="bg-black border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-primary"
                                        >
                                            <option value="pending">Mark Pending</option>
                                            <option value="completed">Mark Completed</option>
                                            <option value="failed">Mark Failed</option>
                                            <option value="refunded">Refund</option>
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
