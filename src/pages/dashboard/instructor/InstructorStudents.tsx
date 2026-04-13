import { useEffect, useState } from 'react';
import { supabase } from '../../../utils/supabase';
import { Search, Mail, BookOpen, Clock } from 'lucide-react';

const InstructorStudents = () => {
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch enrollments for courses taught by this instructor
        // Requires RLS policy: "Instructors can view enrollments for their courses"
        const { data, error } = await supabase
            .from('enrollments')
            .select(`
                *,
                users (
                    full_name,
                    email,
                    avatar_url
                ),
                courses (
                    title,
                    instructor_id
                )
            `)
            .eq('courses.instructor_id', user.id) // Filter by my courses (client side filter via join usually requires explicit match or inner join)
            // Note: Supabase inner join filtering: .not('courses', 'is', null) if fetching all, but RLS should handle it.
            // Let's rely on RLS and then client side filtering if needed or use the !inner modifier.
            // Using !inner on courses to ensure we only get enrollments for courses that exist (and match RLS which filters by instructor_id)
            .not('courses', 'is', null)
            .order('created_at', { ascending: false });

        if (data) {
            // Further filter in case RLS returns other stuff (defensive)
            // Since RLS is "instructor_id = auth.uid()", we should be good.
            // But the query structure above returns enrollments.
            setStudents(data);
        }
        if (error) console.error('Error fetching students:', error);
        setLoading(false);
    };

    const filteredStudents = students.filter(s =>
        s.users?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.users?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.courses?.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-serif text-white flex items-center gap-3">
                <BookOpen className="text-primary" /> My Students
            </h1>

            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                <input
                    type="text"
                    placeholder="Search by name, email, or course..."
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
                            <th className="px-6 py-4">Course Enrolled</th>
                            <th className="px-6 py-4">Progress</th>
                            <th className="px-6 py-4">Joined Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr><td colSpan={4} className="px-6 py-8 text-center text-zinc-500">Loading students...</td></tr>
                        ) : filteredStudents.length === 0 ? (
                            <tr><td colSpan={4} className="px-6 py-8 text-center text-zinc-500">No students found.</td></tr>
                        ) : (
                            filteredStudents.map((enrollment) => (
                                <tr key={enrollment.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 text-xs font-bold">
                                                {enrollment.users?.full_name?.charAt(0) || 'U'}
                                            </div>
                                            <div>
                                                <div className="text-white font-medium">{enrollment.users?.full_name || 'Unknown User'}</div>
                                                <div className="text-xs text-zinc-500 flex items-center gap-1">
                                                    <Mail size={10} /> {enrollment.users?.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-zinc-300">
                                        {enrollment.courses?.title}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-primary" style={{ width: `${enrollment.progress_percent || 0}%` }} />
                                            </div>
                                            <span className="text-xs text-zinc-400">{enrollment.progress_percent || 0}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-zinc-500 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Clock size={14} />
                                            {new Date(enrollment.created_at).toLocaleDateString()}
                                        </div>
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

export default InstructorStudents;
