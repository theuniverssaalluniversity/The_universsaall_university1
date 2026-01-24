import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Search } from 'lucide-react';

const AdminCourses = () => {
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        // Admin sees ALL courses
        const { data, error } = await supabase
            .from('courses')
            .select(`
                *,
                instructor:users!instructor_id(full_name, email)
            `)
            .order('created_at', { ascending: false });

        if (error) console.error(error);
        if (data) setCourses(data);
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this course? This cannot be undone.')) return;
        const { error } = await supabase.from('courses').delete().eq('id', id);
        if (!error) {
            setCourses(courses.filter(c => c.id !== id));
        } else {
            alert('Error deleting course: ' + error.message);
        }
    };

    const filteredCourses = courses.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-serif text-white">Course Management (Admin)</h1>
                <Link to="/admin/create-course" className="flex items-center gap-2 px-4 py-2 bg-primary text-black rounded-lg font-medium hover:bg-primary/90 transition-colors">
                    <Plus size={18} /> Create New
                </Link>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                <input
                    type="text"
                    placeholder="Search by Title or Instructor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-zinc-900 border border-white/10 rounded-lg text-white w-full focus:outline-none focus:border-primary"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    [1, 2, 3].map(i => <div key={i} className="h-64 bg-zinc-900 rounded-xl animate-pulse" />)
                ) : filteredCourses.length === 0 ? (
                    <div className="col-span-full text-center py-20 text-zinc-500">
                        No courses found.
                    </div>
                ) : (
                    filteredCourses.map(course => (
                        <div key={course.id} className="group bg-zinc-900 border border-white/5 rounded-xl overflow-hidden hover:border-primary/50 transition-colors">
                            <div className="aspect-video bg-zinc-800 relative">
                                <img src={course.thumbnail_url} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2">
                                    <Link
                                        to={`/admin/courses/${course.id}/edit`} // Admin specific route
                                        className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                        title="Edit Content"
                                    >
                                        <Edit size={18} />
                                    </Link>
                                    <button onClick={() => handleDelete(course.id)} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors">
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="font-medium text-white text-lg truncate mb-1">{course.title}</h3>
                                <p className="text-zinc-500 text-xs mb-2">By {course.instructor?.full_name || 'Unknown'}</p>
                                <div className="flex items-center justify-between mt-auto">
                                    <span className="text-primary font-bold">${course.price}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full border ${course.status === 'published' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                        }`}>
                                        {course.status.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminCourses;
