import { useEffect, useState } from 'react';
import { supabase } from '../../../utils/supabase';
import { Download } from 'lucide-react';

const InstructorEarnings = () => {
    const [stats, setStats] = useState<{ total: number, pending: number, lastMonth: number, courses?: any[] }>({ total: 0, pending: 0, lastMonth: 0, courses: [] });
    const [sharePercent, setSharePercent] = useState(70);
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
        setSharePercent(sharePercent);

        // 2. Calculate Total Sales (Order Items)
        const { data: courses } = await supabase.from('courses').select('id, title').eq('instructor_id', user.id);
        const courseIds = courses?.map(c => c.id) || [];

        let totalSales = 0;
        let items: any[] = [];
        if (courseIds.length > 0) {
            const { data: fetchedItems } = await supabase
                .from('order_items')
                .select('price, item_id') // Fetch item_id too for grouping
                .eq('item_type', 'course')
                .in('item_id', courseIds);

            items = fetchedItems || [];
            totalSales = items.reduce((sum, item) => sum + item.price, 0);
        }

        // 3. Get Payouts
        const { data: payoutData } = await supabase
            .from('payouts')
            .select('*')
            .eq('instructor_id', user.id)
            .order('created_at', { ascending: false });

        const paidTotal = payoutData?.filter((p: any) => p.status === 'paid').reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0;

        const totalEarnings = (totalSales * sharePercent) / 100;
        const pending = totalEarnings - paidTotal;

        // 4. Calculate Per Course Stats
        const { data: allEnrollments } = await supabase.from('enrollments').select('course_id').in('course_id', courseIds);

        const courseStats = courses?.map((course: any) => {
            const courseSales = items?.filter((i: any) => i.item_id === course.id).reduce((sum: number, i: any) => sum + i.price, 0) || 0;
            const studentCount = allEnrollments?.filter((e: any) => e.course_id === course.id).length || 0;
            return {
                id: course.id,
                title: course.title,
                revenue: courseSales,
                students: studentCount
            };
        }).sort((a: any, b: any) => b.revenue - a.revenue) || [];

        setStats({
            total: totalEarnings,
            pending: pending > 0 ? pending : 0,
            lastMonth: 0,
            courses: courseStats
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

            {/* Course Performance Table */}
            <div className="bg-zinc-900 border border-white/5 rounded-xl p-6">
                <h3 className="text-lg font-medium text-white mb-6">Course Performance</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-zinc-400 text-sm font-medium">
                            <tr>
                                <th className="px-6 py-4">Course Title</th>
                                <th className="px-6 py-4">Students</th>
                                <th className="px-6 py-4">Gross Revenue</th>
                                <th className="px-6 py-4">Your Earnings ({sharePercent}%)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {stats.courses?.length === 0 ? (
                                <tr><td colSpan={4} className="px-6 py-8 text-center text-zinc-500">No course data available.</td></tr>
                            ) : (
                                stats.courses?.map((course: any) => (
                                    <tr key={course.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-medium text-white">{course.title}</td>
                                        <td className="px-6 py-4 text-zinc-400">{course.students}</td>
                                        <td className="px-6 py-4 text-zinc-300">${course.revenue.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-green-400 font-bold">${((course.revenue * sharePercent) / 100).toLocaleString()}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
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
