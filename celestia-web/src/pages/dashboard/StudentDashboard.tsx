import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase';
import { BookOpen, Clock, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
    const [courses, setCourses] = useState<any[]>([]);

    useEffect(() => {
        // Mock user for now if enrollments role logic isn't fully seeded
        // In production: fetch from 'enrollments' joined with 'courses'
        const fetchEnrollments = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from('enrollments')
                .select('*, courses(*)')
                .eq('user_id', user.id);

            if (data) setCourses(data);
        };
        fetchEnrollments();
    }, []);

    return (
        <div className="space-y-8">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Courses in Progress', value: courses.length, icon: BookOpen, color: 'text-blue-500' },
                    { label: 'Hours Learned', value: '12.5', icon: Clock, color: 'text-primary' },
                    { label: 'Average Score', value: '92%', icon: Activity, color: 'text-green-500' },
                ].map((stat, i) => (
                    <div key={i} className="bg-zinc-800/50 border border-white/5 p-6 rounded-2xl flex items-center justify-between">
                        <div>
                            <h4 className="text-zinc-400 text-sm font-medium">{stat.label}</h4>
                            <span className="text-3xl font-serif text-white mt-1 block">{stat.value}</span>
                        </div>
                        <div className={`w-12 h-12 rounded-full bg-white/5 flex items-center justify-center ${stat.color}`}>
                            <stat.icon size={24} />
                        </div>
                    </div>
                ))}
            </div>

            {/* My Courses */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-medium text-white">Continue Learning</h3>
                    <Link to="/courses" className="text-sm text-primary hover:text-white transition-colors flex items-center gap-1">
                        Browse Marketplace <BookOpen size={16} />
                    </Link>
                </div>
                {courses.length === 0 ? (
                    <div className="text-center py-12 bg-zinc-900 rounded-2xl border border-white/5 border-dashed">
                        <p className="text-zinc-500 mb-4">You haven't enrolled in any courses yet.</p>
                        <Link to="/courses" className="px-6 py-2 bg-primary text-black rounded-lg font-medium hover:bg-primary/90 transition-colors">
                            Browse Marketplace
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((enrollment: any) => (
                            <Link to={`/learn/${enrollment.course_id}`} key={enrollment.id} className="block group">
                                <div className="bg-zinc-900 border border-white/5 rounded-xl overflow-hidden hover:border-primary/50 transition-colors h-full">
                                    <div className="aspect-video bg-zinc-800 relative">
                                        {enrollment.courses.thumbnail_url && (
                                            <img src={enrollment.courses.thumbnail_url} className="w-full h-full object-cover" />
                                        )}
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="px-4 py-2 bg-white text-black rounded-full font-medium">Continue</span>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h4 className="font-medium text-white mb-2 group-hover:text-primary transition-colors">{enrollment.courses.title}</h4>
                                        <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary"
                                                style={{ width: `${enrollment.progress_percent}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between mt-2 text-xs text-zinc-500">
                                            <span>{enrollment.progress_percent}% Complete</span>
                                            <span>Last activity: 2d ago</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentDashboard;
