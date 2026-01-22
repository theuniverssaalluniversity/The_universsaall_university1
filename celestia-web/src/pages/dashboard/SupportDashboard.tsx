import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase';
import { Search, ShoppingBag, CheckCircle, XCircle } from 'lucide-react';

const SupportDashboard = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchOrders = async () => {
            // Join with users to see who bought it
            const { data, error } = await supabase
                .from('orders')
                .select('*, users(email, full_name)')
                .order('created_at', { ascending: false })
                .limit(50);

            if (data) setOrders(data);
            if (error) console.error(error);
            setLoading(false);
        };
        fetchOrders();
    }, []);

    const filteredOrders = orders.filter(o =>
        (o.id && o.id.includes(searchTerm)) ||
        (o.users?.email && o.users.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-3xl font-serif text-white">Support Dashboard</h1>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search order ID or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-zinc-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary/50 w-full md:w-64"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-zinc-900 border border-white/5 p-6 rounded-xl flex items-center justify-between">
                    <div>
                        <h4 className="text-zinc-400 text-sm">Open Tickets</h4>
                        <div className="text-4xl font-serif text-white mt-2">0</div>
                    </div>
                    <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500">
                        <ShoppingBag size={24} />
                    </div>
                </div>
            </div>

            <div className="bg-zinc-900 border border-white/5 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/5">
                    <h3 className="text-lg font-medium text-white">Recent Orders</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-zinc-400 text-sm font-medium">
                            <tr>
                                <th className="px-6 py-4">Order ID</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-zinc-500">Loading orders...</td></tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-zinc-500">No orders found.</td></tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr key={order.id || Math.random()} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-mono text-sm text-zinc-400">
                                            #{order.short_id || (order.id ? order.id.slice(0, 8) : '???')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-white">{order.users?.full_name || 'Guest'}</div>
                                            <div className="text-sm text-zinc-500">{order.users?.email || 'No Email'}</div>
                                        </td>
                                        <td className="px-6 py-4 text-white font-medium">
                                            ${order.total_amount || '0.00'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${order.status === 'completed' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                    order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                                        'bg-red-500/10 text-red-500 border-red-500/20'
                                                }`}>
                                                {order.status === 'completed' && <CheckCircle size={10} />}
                                                {order.status === 'pending' && <XCircle size={10} />}
                                                <span className="capitalize">{order.status || 'Unknown'}</span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-zinc-500 text-sm">
                                            {order.created_at ? new Date(order.created_at).toLocaleDateString() : '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SupportDashboard;
