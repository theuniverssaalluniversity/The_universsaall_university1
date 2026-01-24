import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';

const InstructorEarnings = () => {
    const [stats, setStats] = useState({ total: 0, pending: 0, lastMonth: 0 });
    const [payouts, setPayouts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEarnings();
    }, []);

    const fetchEarnings = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 1. Get user share percent
        const { data: userData } = await supabase.from('users').select('revenue_share_percent').eq('id', user.id).single();
        const sharePercent = userData?.revenue_share_percent || 70;

        // 2. Calculate Total Sales (Order Items)
        const { data: courses } = await supabase.from('courses').select('id').eq('instructor_id', user.id);
        const courseIds = courses?.map(c => c.id) || [];

        let totalSales = 0;
        if (courseIds.length > 0) {
            const { data: items } = await supabase
                .from('order_items')
                .select('price')
                .eq('item_type', 'course')
                .in('item_id', courseIds);

            totalSales = items?.reduce((sum, item) => sum + item.price, 0) || 0;
        }

        // 3. Get Payouts
        const { data: payoutData } = await supabase
            .from('payouts')
            .select('*')
            .eq('instructor_id', user.id)
            .order('created_at', { ascending: false });

        const paidTotal = payoutData?.filter(p => p.status === 'paid').reduce((sum, p) => sum + Number(p.amount), 0) || 0;

        const totalEarnings = (totalSales * sharePercent) / 100;
        const pending = totalEarnings - paidTotal;

        setStats({
            total: totalEarnings,
            pending: pending > 0 ? pending : 0,
            lastMonth: 0 // TODO: Add date filtering for last month
        });
        setPayouts(payoutData || []);
        setLoading(false);
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-serif text-white">Earnings & Payouts</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-zinc-900 border border-white/5 p-6 rounded-xl relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors" />
                    <div>
                        <h4 className="text-zinc-400 text-sm">Lifetime Earnings</h4>
                        <div className="text-4xl font-serif text-white mt-2">${stats.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    </div>
                </div>
                <div className="bg-zinc-900 border border-white/5 p-6 rounded-xl">
                    <div>
                        <h4 className="text-zinc-400 text-sm">Pending Payout</h4>
                        <div className="text-4xl font-serif text-zinc-300 mt-2">${stats.pending.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        <div className="text-xs text-zinc-500 mt-1">Payable by Admin</div>
                    </div>
                </div>
            </div>

            <div className="bg-zinc-900 border border-white/5 rounded-xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-medium text-white">Payout History</h3>
                    <button className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors">
                        <Download size={16} /> Export CSV
                    </button>
                </div>

                <table className="w-full text-left">
                    <thead className="bg-white/5 text-zinc-400 text-sm font-medium">
                        <tr>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Reference ID</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr><td colSpan={4} className="px-6 py-8 text-center text-zinc-500">Loading history...</td></tr>
                        ) : payouts.length === 0 ? (
                            <tr><td colSpan={4} className="px-6 py-8 text-center text-zinc-500">No payouts yet.</td></tr>
                        ) : (
                            payouts.map((payout) => (
                                <tr key={payout.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 text-zinc-300">{new Date(payout.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-zinc-500 font-mono text-xs">{payout.reference_id || '-'}</td>
                                    <td className="px-6 py-4 text-white font-medium">${payout.amount}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs px-2 py-1 rounded capitalize ${payout.status === 'paid' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                                            }`}>
                                            {payout.status}
                                        </span>
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

export default InstructorEarnings;
