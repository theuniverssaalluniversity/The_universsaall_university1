import { useEffect, useState } from 'react';
import { supabase } from '../../../utils/supabase';
import { Search, Plus, Trash2 } from 'lucide-react';

const SupportEnrollments = () => {
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

    const filteredEnrollments = enrollments.filter(e =>
        e.users?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.courses?.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-serif text-white">Enrollment Management</h1>
                <button className="flex items-center gap-2 px-4 py-2 bg-primary text-black rounded-lg font-medium hover:bg-primary/90 transition-colors pointer-events-none opacity-50">
                    <Plus size={18} /> Manual Enroll (Soon)
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
        </div>
    );
};

export default SupportEnrollments;
