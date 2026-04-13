import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase';
import { Plus, Trash2, RefreshCw, Power } from 'lucide-react';

type Coupon = {
    id: string;
    code: string;
    discount_type: 'percent' | 'fixed';
    discount_value: number;
    valid_until: string | null;
    max_uses: number | null;
    times_used: number;
    is_active: boolean;
    created_at: string;
};

const AdminCoupons = () => {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        code: '',
        discount_value: 10,
        valid_until: '',
        max_uses: ''
    });

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('coupons')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching coupons:', error);
            // If table doesn't exist, we might get an error here.
        } else {
            setCoupons(data || []);
        }
        setLoading(false);
    };

    const generateCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setFormData(prev => ({ ...prev, code: result }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const { error } = await supabase.from('coupons').insert({
                code: formData.code.toUpperCase(),
                discount_type: 'percent', // Matched with DB constraint
                discount_value: Number(formData.discount_value),
                valid_until: formData.valid_until || null,
                max_uses: formData.max_uses ? Number(formData.max_uses) : null,
                is_active: true
            });

            if (error) throw error;

            alert('Coupon created successfully!');
            setIsModalOpen(false);
            setFormData({ code: '', discount_value: 10, valid_until: '', max_uses: '' });
            fetchCoupons();

        } catch (err: any) {
            alert('Error creating coupon: ' + err.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Permanently delete this coupon?')) return;
        const { error } = await supabase.from('coupons').delete().eq('id', id);
        if (!error) fetchCoupons();
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        const { error } = await supabase
            .from('coupons')
            .update({ is_active: !currentStatus })
            .eq('id', id);
        if (!error) fetchCoupons();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-serif text-white">Coupon Management</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-black rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                    <Plus size={18} /> Create Coupon
                </button>
            </div>

            <div className="bg-zinc-900 border border-white/5 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-zinc-400 text-sm font-medium">
                        <tr>
                            <th className="px-6 py-4">Code</th>
                            <th className="px-6 py-4">Discount</th>
                            <th className="px-6 py-4">Usage</th>
                            <th className="px-6 py-4">Expires</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr><td colSpan={6} className="px-6 py-8 text-center text-zinc-500">Loading coupons...</td></tr>
                        ) : coupons.length === 0 ? (
                            <tr><td colSpan={6} className="px-6 py-8 text-center text-zinc-500">No coupons created yet.</td></tr>
                        ) : (
                            coupons.map((coupon) => (
                                <tr key={coupon.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 text-white font-mono font-bold tracking-wider">
                                        {coupon.code}
                                    </td>
                                    <td className="px-6 py-4 text-primary font-medium">
                                        {coupon.discount_value}% OFF
                                    </td>
                                    <td className="px-6 py-4 text-zinc-300">
                                        {coupon.times_used} / {coupon.max_uses || '∞'}
                                    </td>
                                    <td className="px-6 py-4 text-zinc-400 text-sm">
                                        {coupon.valid_until ? new Date(coupon.valid_until).toLocaleDateString() : 'Never'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${coupon.is_active ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                            {coupon.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 flex gap-2">
                                        <button
                                            onClick={() => toggleStatus(coupon.id, coupon.is_active)}
                                            className={`p-2 rounded transition-colors ${coupon.is_active ? 'text-zinc-500 hover:text-white hover:bg-zinc-800' : 'text-green-400 hover:bg-green-500/10'}`}
                                            title={coupon.is_active ? "Deactivate" : "Activate"}
                                        >
                                            <Power size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(coupon.id)}
                                            className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create Coupon Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-md space-y-6 relative shadow-2xl">
                        <h2 className="text-xl font-bold text-white">Create New Coupon</h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">Coupon Code</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        required
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white font-mono placeholder:text-zinc-700 focus:outline-none focus:border-primary/50"
                                        placeholder="SUMMER25"
                                    />
                                    <button
                                        type="button"
                                        onClick={generateCode}
                                        className="p-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
                                        title="Generate Random"
                                    >
                                        <RefreshCw size={18} />
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">Discount Percentage (%)</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    max="100"
                                    value={formData.discount_value}
                                    onChange={(e) => setFormData({ ...formData, discount_value: Number(e.target.value) })}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary/50"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-zinc-400 mb-1">Max Uses (Optional)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.max_uses}
                                        onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary/50"
                                        placeholder="∞"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-zinc-400 mb-1">Valid Until (Optional)</label>
                                    <input
                                        type="date"
                                        value={formData.valid_until}
                                        onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary/50"
                                    />
                                </div>
                            </div>

                            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                                <p className="text-xs text-primary text-center">
                                    Coupons apply to all courses globally.
                                </p>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-primary text-black py-2.5 rounded-lg font-bold hover:bg-primary/90 transition-colors"
                                >
                                    Create Coupon
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2.5 bg-zinc-800 text-white rounded-lg font-medium hover:bg-zinc-700 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCoupons;
