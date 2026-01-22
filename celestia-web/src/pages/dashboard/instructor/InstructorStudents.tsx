import { useEffect, useState } from 'react';
import { supabase } from '../../../utils/supabase';

const InstructorStudents = () => {
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch enrollments for my courses
        // Note: In a real large scale app, this would be a dedicated RPC or filtered view
        const { data: myCourses } = await supabase.from('courses').select('id, title').eq('instructor_id', user.id);

        if (myCourses && myCourses.length > 0) {
            const courseIds = myCourses.map((c: any) => c.id);
            const { data } = await supabase
                .from('enrollments')
                .select('*, users(full_name, email, avatar_url), courses(title)')
                .in('course_id', courseIds)
                .order('created_at', { ascending: false });

            if (data) setStudents(data);
        }
        setLoading(false);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-serif text-white">Your Students</h1>

            <div className="bg-zinc-900 border border-white/5 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-zinc-400 text-sm font-medium">
                        <tr>
                            <th className="px-6 py-4">Student Name</th>
                            <th className="px-6 py-4">Enrolled Course</th>
                            <th className="px-6 py-4">Progress</th>
                            <th className="px-6 py-4">Joined Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr><td colSpan={4} className="px-6 py-8 text-center text-zinc-500">Loading...</td></tr>
                        ) : students.length === 0 ? (
                            <tr><td colSpan={4} className="px-6 py-8 text-center text-zinc-500">No students found yet.</td></tr>
                        ) : (
                            students.map((record) => (
                                <tr key={record.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs text-zinc-400 font-bold">
                                                {record.users?.full_name?.charAt(0) || 'U'}
                                            </div>
                                            <div>
                                                <div className="text-white">{record.users?.full_name}</div>
                                                <div className="text-xs text-zinc-500">{record.users?.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-zinc-300">
                                        {record.courses?.title}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-green-500" style={{ width: `${record.progress}%` }} />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-zinc-500 text-sm">
                                        {new Date(record.created_at).toLocaleDateString()}
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
