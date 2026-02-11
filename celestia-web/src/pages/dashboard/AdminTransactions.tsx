import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminTransactions = () => {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        setLoading(true);
        // Join with users to show who paid
        const { data } = await supabase
            .from('transactions')
            .select('*, users(full_name, email)')
            .order('created_at', { ascending: false });

        if (data) setTransactions(data);
        setLoading(false);
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <Link to="/admin" className="text-zinc-500 hover:text-white flex items-center gap-2 mb-2">
                        <ArrowLeft size={16} /> Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-serif text-white">Transactions</h1>
                    <p className="text-zinc-400">Monitor all payments (Razorpay, Stripe)</p>
                </div>
            </div>

            <div className="bg-zinc-900 border border-white/10 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-black/40 text-xs uppercase text-zinc-500 font-medium">
                            <tr>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Provider</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Txn ID</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr><td colSpan={6} className="text-center py-8 text-zinc-500">Loading transactions...</td></tr>
                            ) : transactions.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-8 text-zinc-500">No transactions found.</td></tr>
                            ) : (
                                transactions.map((txn) => (
                                    <tr key={txn.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 text-zinc-400 text-sm">
                                            {new Date(txn.created_at).toLocaleDateString()} <br />
                                            <span className="text-xs text-zinc-600">{new Date(txn.created_at).toLocaleTimeString()}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-white font-medium">{txn.users?.full_name || 'Unknown'}</div>
                                            <div className="text-xs text-zinc-500">{txn.users?.email}</div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-white">
                                            {txn.currency} {txn.amount}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-block px-2 py-1 rounded text-xs font-bold uppercase ${txn.provider === 'razorpay' ? 'bg-blue-500/10 text-blue-500' :
                                                txn.provider === 'stripe' ? 'bg-purple-500/10 text-purple-500' :
                                                    'bg-zinc-800 text-zinc-400'
                                                }`}>
                                                {txn.provider}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${txn.status === 'completed' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                txn.status === 'failed' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                    'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                                }`}>
                                                {txn.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-zinc-500 font-mono">
                                            {txn.provider_transaction_id || '-'}
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

export default AdminTransactions;
