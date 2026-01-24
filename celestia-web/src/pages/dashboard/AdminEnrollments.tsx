import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase';
import { Search, Plus, Trash2 } from 'lucide-react';

const AdminEnrollments = () => {
    const [enrollments, setEnrollments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchEnrollments();
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

    const handleRevoke = async (id: string) => {
        if (!confirm('Are you sure you want to revoke this enrollment?')) return;

        const { error } = await supabase.from('enrollments').delete().eq('id', id);
        if (!error) {
            setEnrollments(enrollments.filter(e => e.id !== id));
        }
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [courses, setCourses] = useState<any[]>([]);
    const [manualEmail, setManualEmail] = useState('');
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [enrollLoading, setEnrollLoading] = useState(false);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        const { data } = await supabase.from('courses').select('id, title').eq('status', 'published').order('title');
        if (data) setCourses(data);
    };

    const handleManualEnroll = async (e: React.FormEvent) => {
        e.preventDefault();
        setEnrollLoading(true);

        try {
            // 1. Find User by Email
            const { data: users, error: userError } = await supabase
                .from('users')
                .select('id')
                .eq('email', manualEmail.trim())
                .single();

            if (userError || !users) {
                alert('User not found with this email.');
                setEnrollLoading(false);
                return;
            }

            // 2. Create Enrollment
            const { error: enrollError } = await supabase
                .from('enrollments')
                .insert({
                    user_id: users.id,
                    course_id: selectedCourseId
                });

            if (enrollError) {
                if (enrollError.code === '23505') { // Unique violation
                    alert('User is already enrolled in this course.');
                } else {
                    alert('Error enrolling user: ' + enrollError.message);
                }
            } else {
                alert('User enrolled successfully!');
                setIsModalOpen(false);
                setManualEmail('');
                setSelectedCourseId('');
                fetchEnrollments();
            }
        } catch (err) {
            console.error(err);
            alert('Unexpected error occurred.');
        } finally {
            setEnrollLoading(false);
        }
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
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-black rounded-lg font-medium hover:bg-primary/90 transition-colors"
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
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-md space-y-6 relative shadow-2xl">
                        <h2 className="text-xl font-bold text-white">Manual Enrollment</h2>

                        <form onSubmit={handleManualEnroll} className="space-y-4">
                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">User Email</label>
                                <input
                                    type="email"
                                    required
                                    value={manualEmail}
                                    onChange={(e) => setManualEmail(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary/50"
                                    placeholder="student@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">Select Course</label>
                                <select
                                    required
                                    value={selectedCourseId}
                                    onChange={(e) => setSelectedCourseId(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary/50"
                                >
                                    <option value="">-- Choose a Course --</option>
                                    {courses.map(c => (
                                        <option key={c.id} value={c.id}>{c.title}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={enrollLoading}
                                    className="flex-1 bg-primary text-black py-2.5 rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
                                >
                                    {enrollLoading ? 'Enrolling...' : 'Enroll User'}
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

export default AdminEnrollments;
