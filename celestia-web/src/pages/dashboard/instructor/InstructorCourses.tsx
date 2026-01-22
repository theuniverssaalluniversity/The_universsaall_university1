import { useEffect, useState } from 'react';
import { supabase } from '../../../utils/supabase';
import { Link } from 'react-router-dom';
import { Plus, Eye, Edit, Trash2 } from 'lucide-react';

const InstructorCourses = () => {
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from('courses')
            .select('*')
            .eq('instructor_id', user.id)
            .order('created_at', { ascending: false });

        if (data) setCourses(data);
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this course? This cannot be undone.')) return;
        const { error } = await supabase.from('courses').delete().eq('id', id);
        if (!error) {
            setCourses(courses.filter(c => c.id !== id));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-serif text-white">My Courses</h1>
                <Link to="/instructor/create-course" className="flex items-center gap-2 px-4 py-2 bg-primary text-black rounded-lg font-medium hover:bg-primary/90 transition-colors">
                    <Plus size={18} /> Create New
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    [1, 2, 3].map(i => <div key={i} className="h-64 bg-zinc-900 rounded-xl animate-pulse" />)
                ) : courses.length === 0 ? (
                    <div className="col-span-full text-center py-20 text-zinc-500">
                        You haven't created any courses yet.
                    </div>
                ) : (
                    courses.map(course => (
                        <div key={course.id} className="group bg-zinc-900 border border-white/5 rounded-xl overflow-hidden hover:border-primary/50 transition-colors">
                            <div className="aspect-video bg-zinc-800 relative">
                                <img src={course.thumbnail_url} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <Link
                                        to={`/instructor/courses/${course.id}/edit`}
                                        className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                        title="Edit Content"
                                    >
                                        <Eye size={18} />
                                    </Link>
                                    <button onClick={() => handleDelete(course.id)} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors">
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="font-medium text-white text-lg truncate mb-1">{course.title}</h3>
                                <p className="text-zinc-500 text-xs mb-4 line-clamp-2">{course.description}</p>
                                <div className="flex items-center justify-between mt-auto">
                                    <span className="text-primary font-bold">${course.price}</span>
                                    <span className="text-xs text-zinc-500 uppercase tracking-wider">{course.status}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default InstructorCourses;
