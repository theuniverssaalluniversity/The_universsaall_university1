import { useEffect, useState } from 'react';
import { Plus, BookOpen, DollarSign, Users } from 'lucide-react';
import { supabase } from '../../utils/supabase';
import { Link } from 'react-router-dom';

const InstructorDashboard = () => {
    const [stats, setStats] = useState({ students: 0, courses: 0, revenue: 0 });
    const [activeCourses, setActiveCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch Courses
            const { data: courses } = await supabase
                .from('courses')
                .select('*')
                .eq('instructor_id', user.id);

            if (courses) {
                setActiveCourses(courses);
                setStats(prev => ({ ...prev, courses: courses.length }));
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-serif text-white">Instructor Overview</h1>
                <Link to="/instructor/create-course" className="flex items-center gap-2 px-4 py-2 bg-primary text-black rounded-lg font-medium hover:bg-primary/90 transition-colors">
                    <Plus size={18} /> Create New Course
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-zinc-900 border border-white/5 p-6 rounded-xl flex items-center justify-between">
                    <div>
                        <h4 className="text-zinc-400 text-sm">Total Students</h4>
                        <div className="text-4xl font-serif text-white mt-2">{stats.students}</div>
                    </div>
                    <Users size={24} className="text-zinc-600" />
                </div>
                <div className="bg-zinc-900 border border-white/5 p-6 rounded-xl flex items-center justify-between">
                    <div>
                        <h4 className="text-zinc-400 text-sm">Active Courses</h4>
                        <div className="text-4xl font-serif text-white mt-2">{stats.courses}</div>
                    </div>
                    <BookOpen size={24} className="text-zinc-600" />
                </div>
                <div className="bg-zinc-900 border border-white/5 p-6 rounded-xl flex items-center justify-between">
                    <div>
                        <h4 className="text-zinc-400 text-sm">Total Revenue</h4>
                        <div className="text-4xl font-serif text-white mt-2">${stats.revenue}</div>
                    </div>
                    <DollarSign size={24} className="text-zinc-600" />
                </div>
            </div>

            <div className="bg-zinc-900 border border-white/5 rounded-xl p-6">
                <h3 className="text-lg font-medium text-white mb-4">Your Active Courses</h3>

                {loading ? (
                    <div className="text-zinc-500">Loading courses...</div>
                ) : activeCourses.length === 0 ? (
                    <div className="text-zinc-500 text-center py-8">
                        No active courses found. Start creating one!
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activeCourses.map((course) => (
                            <div key={course.id} className="bg-black/40 border border-white/5 rounded-lg overflow-hidden">
                                <div className="aspect-video bg-zinc-800 relative">
                                    <img src={course.thumbnail_url} className="w-full h-full object-cover" />
                                    <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-xs text-white uppercase font-bold">
                                        {course.status}
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h4 className="font-medium text-white truncate">{course.title}</h4>
                                    <div className="flex justify-between items-center mt-4">
                                        <span className="text-primary font-medium">${course.price}</span>
                                        <span className="text-xs text-zinc-500">0 Students</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default InstructorDashboard;
