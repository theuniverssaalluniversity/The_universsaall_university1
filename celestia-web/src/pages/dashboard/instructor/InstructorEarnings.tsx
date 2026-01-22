import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';

const InstructorEarnings = () => {
    const [stats, setStats] = useState({ total: 0, pending: 0, lastMonth: 0 });
    // const [loading, setLoading] = useState(true); // Unused for now

    useEffect(() => {
        // Mock calculation for now as we don't have a split-payments system yet
        // In a real app, this would query a 'payouts' or 'ledger' table
        setTimeout(() => {
            setStats({ total: 1250.00, pending: 250.00, lastMonth: 450.00 });
            // setLoading(false);
        }, 1000);
    }, []);

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-serif text-white">Earnings & Payouts</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-zinc-900 border border-white/5 p-6 rounded-xl relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors" />
                    <div>
                        <h4 className="text-zinc-400 text-sm">Lifetime Earnings</h4>
                        <div className="text-4xl font-serif text-white mt-2">${stats.total.toLocaleString()}</div>
                    </div>
                </div>
                <div className="bg-zinc-900 border border-white/5 p-6 rounded-xl">
                    <div>
                        <h4 className="text-zinc-400 text-sm">Pending Payout</h4>
                        <div className="text-4xl font-serif text-zinc-300 mt-2">${stats.pending.toLocaleString()}</div>
                        <div className="text-xs text-zinc-500 mt-1">Scheduled for next Friday</div>
                    </div>
                </div>
                <div className="bg-zinc-900 border border-white/5 p-6 rounded-xl">
                    <div>
                        <h4 className="text-zinc-400 text-sm">Last Month</h4>
                        <div className="text-4xl font-serif text-zinc-300 mt-2">${stats.lastMonth.toLocaleString()}</div>
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
                        <tr className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 text-zinc-300">Oct 15, 2025</td>
                            <td className="px-6 py-4 text-zinc-500 font-mono text-xs">PAY-827364</td>
                            <td className="px-6 py-4 text-white font-medium">$450.00</td>
                            <td className="px-6 py-4"><span className="text-green-500 text-xs bg-green-500/10 px-2 py-1 rounded">Paid</span></td>
                        </tr>
                        <tr className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 text-zinc-300">Sep 15, 2025</td>
                            <td className="px-6 py-4 text-zinc-500 font-mono text-xs">PAY-192837</td>
                            <td className="px-6 py-4 text-white font-medium">$380.00</td>
                            <td className="px-6 py-4"><span className="text-green-500 text-xs bg-green-500/10 px-2 py-1 rounded">Paid</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default InstructorEarnings;
