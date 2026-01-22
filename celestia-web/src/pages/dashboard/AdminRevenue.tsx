import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase';
import { DollarSign, TrendingUp, Calendar } from 'lucide-react';

const AdminRevenue = () => {
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRevenue = async () => {
            // In a real app, use a dedicated RPC function for sum to avoid fetching all rows
            const { data, error } = await supabase
                .from('orders')
                .select('total_amount, status')
                .eq('status', 'completed');

            if (data) {
                const total = data.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0);
                setTotalRevenue(total);
            }
            if (error) console.error(error);
            setLoading(false);
        };
        fetchRevenue();
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-serif text-white">Revenue Analytics</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-zinc-900 border border-white/5 p-6 rounded-xl flex items-center justify-between">
                    <div>
                        <h4 className="text-zinc-400 text-sm">Total Sales</h4>
                        <div className="text-4xl font-serif text-white mt-2">
                            {loading ? '...' : `$${totalRevenue.toLocaleString()}`}
                        </div>
                    </div>
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                        <DollarSign size={24} />
                    </div>
                </div>

                <div className="bg-zinc-900 border border-white/5 p-6 rounded-xl flex items-center justify-between">
                    <div>
                        <h4 className="text-zinc-400 text-sm">Growth (MoM)</h4>
                        <div className="text-4xl font-serif text-green-500 mt-2">+0%</div>
                    </div>
                    <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center text-green-500">
                        <TrendingUp size={24} />
                    </div>
                </div>

                <div className="bg-zinc-900 border border-white/5 p-6 rounded-xl flex items-center justify-between">
                    <div>
                        <h4 className="text-zinc-400 text-sm">Last 30 Days</h4>
                        <div className="text-4xl font-serif text-white mt-2">$0</div>
                    </div>
                    <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400">
                        <Calendar size={24} />
                    </div>
                </div>
            </div>

            <div className="bg-zinc-900 border border-white/5 rounded-xl p-8 flex items-center justify-center h-96 text-zinc-500">
                Chart Visualization Unavailable (Requires Chart.js or similar)
            </div>
        </div>
    );
};

export default AdminRevenue;
