import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase';
import { DollarSign, TrendingUp, Calendar, CreditCard, Save } from 'lucide-react';

interface TeacherStat {
    id: string;
    full_name: string;
    email: string;
    total_sales: number;
    revenue_share: number; // percent
    total_earnings: number;
    paid_amount: number;
    pending_amount: number;
}

const AdminRevenue = () => {
    const [teachers, setTeachers] = useState<TeacherStat[]>([]);
    const [loading, setLoading] = useState(true);
    const [paymentModalUser, setPaymentModalUser] = useState<TeacherStat | null>(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentRef, setPaymentRef] = useState('');

    useEffect(() => {
        fetchTeacherStats();
    }, []);

    const fetchTeacherStats = async () => {
        setLoading(true);
        // 1. Fetch all instructors
        const { data: instructors } = await supabase
            .from('users')
            .select('id, full_name, email, revenue_share_percent')
            .eq('role', 'instructor');

        if (instructors) {
            // Calculate stats for each
            const stats = await Promise.all(instructors.map(async (instructor) => {
                // Get courses
                const { data: courses } = await supabase.from('courses').select('id').eq('instructor_id', instructor.id);
                const courseIds = courses?.map(c => c.id) || [];

                let totalSales = 0;
                if (courseIds.length > 0) {
                    // Get order items for these courses
                    const { data: items } = await supabase
                        .from('order_items')
                        .select('price')
                        .eq('item_type', 'course')
                        .in('item_id', courseIds); // Ensure manual_migration_phase10.sql is run for filtered policy if needed, 
                    // or use admin privilege (RLS usually allows admin all)
                    totalSales = items?.reduce((sum, item) => sum + item.price, 0) || 0;
                }

                // Get Payouts
                const { data: payouts } = await supabase
                    .from('payouts')
                    .select('amount')
                    .eq('instructor_id', instructor.id)
                    .eq('status', 'paid');

                const paidTotal = payouts?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

                const sharePercent = instructor.revenue_share_percent || 70;
                const totalEarnings = (totalSales * sharePercent) / 100;
                const pending = totalEarnings - paidTotal;

                return {
                    id: instructor.id,
                    full_name: instructor.full_name,
                    email: instructor.email,
                    revenue_share: sharePercent,
                    total_sales: totalSales,
                    total_earnings: totalEarnings,
                    paid_amount: paidTotal,
                    pending_amount: pending > 0 ? pending : 0
                };
            }));
            setTeachers(stats);
        }
        setLoading(false);
    };

    const handleProcessPayment = async () => {
        if (!paymentModalUser || !paymentAmount) return;

        const { error } = await supabase.from('payouts').insert({
            instructor_id: paymentModalUser.id,
            amount: Number(paymentAmount),
            status: 'paid', // Direct mark as paid for manual entry
            reference_id: paymentRef,
            remarks: 'Manual admin payout'
        });

        if (!error) {
            setPaymentModalUser(null);
            setPaymentAmount('');
            setPaymentRef('');
            fetchTeacherStats();
        } else {
            alert('Error creating payout: ' + error.message);
        }
    };

    const updateSharePercent = async (id: string, percent: number) => {
        const { error } = await supabase.from('users').update({ revenue_share_percent: percent }).eq('id', id);
        if (!error) fetchTeacherStats();
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-serif text-white">Teacher Revenue & Payments</h1>

            {/* Overview Cards (Platform Wide) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-zinc-900 border border-white/5 p-6 rounded-xl flex items-center justify-between">
                    <div>
                        <h4 className="text-zinc-400 text-sm">Total Instructor Earnings</h4>
                        <div className="text-4xl font-serif text-white mt-2">
                            ${teachers.reduce((sum, t) => sum + t.total_earnings, 0).toLocaleString()}
                        </div>
                    </div>
                </div>
                <div className="bg-zinc-900 border border-white/5 p-6 rounded-xl flex items-center justify-between">
                    <div>
                        <h4 className="text-zinc-400 text-sm">Total Paid Out</h4>
                        <div className="text-4xl font-serif text-green-500 mt-2">
                            ${teachers.reduce((sum, t) => sum + t.paid_amount, 0).toLocaleString()}
                        </div>
                    </div>
                </div>
                <div className="bg-zinc-900 border border-white/5 p-6 rounded-xl flex items-center justify-between">
                    <div>
                        <h4 className="text-zinc-400 text-sm">Pending Payouts</h4>
                        <div className="text-4xl font-serif text-red-400 mt-2">
                            ${teachers.reduce((sum, t) => sum + t.pending_amount, 0).toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>

            {/* Teacher List */}
            <div className="bg-zinc-900 border border-white/5 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-zinc-400 text-sm font-medium">
                        <tr>
                            <th className="px-6 py-4">Instructor</th>
                            <th className="px-6 py-4">Sales / Split</th>
                            <th className="px-6 py-4">Earnings</th>
                            <th className="px-6 py-4">Paid</th>
                            <th className="px-6 py-4">Pending</th>
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr><td colSpan={6} className="px-6 py-8 text-center text-zinc-500">Loading data...</td></tr>
                        ) : teachers.map((teacher) => (
                            <tr key={teacher.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="text-white font-medium">{teacher.full_name}</div>
                                    <div className="text-xs text-zinc-500">{teacher.email}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-white">${teacher.total_sales.toLocaleString()}</div>
                                    <div className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
                                        Split:
                                        <input
                                            type="number"
                                            className="bg-black border border-zinc-700 w-12 text-center rounded text-xs px-1"
                                            defaultValue={teacher.revenue_share}
                                            onBlur={(e) => updateSharePercent(teacher.id, Number(e.target.value))}
                                        /> %
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-white font-medium">
                                    ${teacher.total_earnings.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-green-400">
                                    ${teacher.paid_amount.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-red-400 font-bold">
                                    ${teacher.pending_amount.toLocaleString()}
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => setPaymentModalUser(teacher)}
                                        className="bg-primary text-black px-3 py-1.5 rounded text-sm font-bold hover:bg-primary/90"
                                    >
                                        Pay
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Payment Modal */}
            {paymentModalUser && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <div className="bg-zinc-900 border border-white/10 p-6 rounded-xl w-full max-w-md">
                        <h2 className="text-xl font-serif text-white mb-4">Record Payment</h2>
                        <p className="text-zinc-400 mb-6">
                            Recording payment for <span className="text-white font-medium">{paymentModalUser.full_name}</span>.
                            <br />
                            Pending Balance: <span className="text-primary">${paymentModalUser.pending_amount}</span>
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">Amount ($)</label>
                                <input
                                    type="number"
                                    value={paymentAmount}
                                    onChange={e => setPaymentAmount(e.target.value)}
                                    className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">Reference ID (Txn Hash/Bank Ref)</label>
                                <input
                                    type="text"
                                    value={paymentRef}
                                    onChange={e => setPaymentRef(e.target.value)}
                                    className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <button
                                onClick={() => setPaymentModalUser(null)}
                                className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleProcessPayment}
                                className="px-4 py-2 bg-green-500 text-black rounded-lg hover:bg-green-400 font-bold"
                            >
                                Confirm Payment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminRevenue;
