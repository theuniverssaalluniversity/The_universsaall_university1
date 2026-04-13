import { useEffect, useState } from 'react';
import { supabase } from '../../../utils/supabase';
import { Search, Trash2, Plus } from 'lucide-react';

const SupportEnrollments = () => {
    const [enrollments, setEnrollments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Manual Enrollment State
    const [showAddModal, setShowAddModal] = useState(false);
    const [allCourses, setAllCourses] = useState<any[]>([]);
    const [formData, setFormData] = useState({ email: '', courseId: '', price: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchEnrollments();
        fetchCourses();
    }, []);

    const fetchEnrollments = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('enrollments')
            .select('*, users(email, full_name), courses(title)')
            .order('created_at', { ascending: false });

        if (data) setEnrollments(data);
        if (error) console.error(error);
        setLoading(false);
    };

    const fetchCourses = async () => {
        const { data } = await supabase.from('courses').select('id, title, price').eq('status', 'published');
        if (data) setAllCourses(data);
    };

    const handleRevoke = async (id: string) => {
        if (!confirm('Are you sure you want to revoke this enrollment?')) return;

        const { error } = await supabase.from('enrollments').delete().eq('id', id);
        if (!error) {
            setEnrollments(enrollments.filter(e => e.id !== id));
        }
    };

    const handleManualEnrollment = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            // 1. Find User
            const { data: users, error: userError } = await supabase
                .from('users')
                .select('id')
                .eq('email', formData.email)
                .single();

            if (userError || !users) {
                alert('User not found with this email.');
                setSubmitting(false);
                return;
            }

            const userId = users.id;
            const price = Number(formData.price);

            // 2. Create Order (Completed)
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert({
                    user_id: userId,
                    total_amount: price,
                    status: 'completed',
                    payment_provider: 'manual_admin',
                    payment_id: `MANUAL-${Date.now()}`
                })
                .select()
                .single();

            if (orderError) throw orderError;

            // 3. Create Order Item
            const { error: itemError } = await supabase
                .from('order_items')
                .insert({
                    order_id: order.id,
                    item_type: 'course',
                    item_id: formData.courseId,
                    price: price
                });

            if (itemError) throw itemError;

            // 4. Create Enrollment
            const { error: enrollError } = await supabase
                .from('enrollments')
                .insert({
                    user_id: userId,
                    course_id: formData.courseId,
                    progress_percent: 0
                });

            if (enrollError) {
                if (enrollError.code === '23505') {
                    alert('User is already enrolled in this course.');
                } else {
                    throw enrollError;
                }
            } else {
                alert('Enrollment successful! Revenue recorded.');
                setShowAddModal(false);
                setFormData({ email: '', courseId: '', price: '' });
                fetchEnrollments();
            }

        } catch (error: any) {
            console.error(error);
            alert('Error enrolling user: ' + error.message);
        }
        setSubmitting(false);
    };

    const filteredEnrollments = enrollments.filter(e =>
        e.users?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.courses?.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-serif text-white">Enrollment Management</h1>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-black rounded-lg font-bold hover:bg-primary/90 transition-colors"
                >
                    <Plus size={18} /> Manual Enroll
                </button>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                <input
                    type="text"
                    placeholder="Search by User or Course..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-zinc-900 border border-white/10 rounded-lg text-white w-full focus:outline-none focus:border-primary"
                />
            </div>

            <div className="bg-zinc-900 border border-white/5 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-zinc-400 text-sm font-medium">
                        <tr>
                            <th className="px-6 py-4">Student</th>
                            <th className="px-6 py-4">Course</th>
                            <th className="px-6 py-4">Progress</th>
                            <th className="px-6 py-4">Enrolled Date</th>
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr><td colSpan={5} className="px-6 py-8 text-center text-zinc-500">Loading...</td></tr>
                        ) : filteredEnrollments.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-8 text-center text-zinc-500">No enrollments found.</td></tr>
                        ) : (
                            filteredEnrollments.map((enrollment) => (
                                <tr key={enrollment.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="text-white">{enrollment.users?.full_name}</div>
                                        <div className="text-sm text-zinc-500">{enrollment.users?.email}</div>
                                    </td>
                                    <td className="px-6 py-4 text-white">
                                        {enrollment.courses?.title}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary"
                                                style={{ width: `${enrollment.progress || 0}%` }}
                                            />
                                        </div>
                                        <div className="text-xs text-zinc-500 mt-1">{enrollment.progress || 0}% Complete</div>
                                    </td>
                                    <td className="px-6 py-4 text-zinc-500 text-sm">
                                        {new Date(enrollment.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleRevoke(enrollment.id)}
                                            className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/10 rounded transition-colors"
                                            title="Revoke Access"
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

            {/* Manual Enrollment Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <div className="bg-zinc-900 border border-white/10 p-6 rounded-xl w-full max-w-md">
                        <h2 className="text-xl font-serif text-white mb-4">Manual Enrollment</h2>
                        <form onSubmit={handleManualEnrollment} className="space-y-4">
                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">User Email</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white"
                                    placeholder="student@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">Select Course</label>
                                <select
                                    required
                                    value={formData.courseId}
                                    onChange={e => setFormData({ ...formData, courseId: e.target.value })}
                                    className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white"
                                >
                                    <option value="">-- Select Course --</option>
                                    {allCourses.map(c => (
                                        <option key={c.id} value={c.id}>{c.title} (${c.price})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">Enrollment Price ($)</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                                    className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white"
                                />
                                <p className="text-xs text-zinc-500 mt-1">
                                    Set to 0 for free access. This amount will be recorded in revenue.
                                </p>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 bg-primary text-black rounded-lg hover:bg-primary/90 font-medium disabled:opacity-50"
                                >
                                    {submitting ? 'Enrolling...' : 'Confirm Enrollment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupportEnrollments;
