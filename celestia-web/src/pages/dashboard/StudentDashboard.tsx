import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase';
import { BookOpen, CheckCircle, Award, Sparkles, LayoutDashboard, Users, ShoppingBag, Settings, LogOut, Menu, X, LifeBuoy, Tag, HelpCircle, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
    const [courses, setCourses] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]); // New state for services
    const [stats, setStats] = useState({
        lessonsLearned: 0,
        certificates: 0,
        coursesInProgress: 0
    });
    const [loading, setLoading] = useState(true);

    // Icon map for dynamic categories
    const IconMap: any = {
        LayoutDashboard, BookOpen, Users, ShoppingBag, Settings, LogOut, Menu, X, LifeBuoy, Tag, HelpCircle, Sparkles
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 1. Fetch Services (New)
            const { data: serviceData } = await supabase
                .from('service_categories')
                .select('*')
                .eq('is_visible', true)
                .order('sort_order', { ascending: true });

            if (serviceData) setServices(serviceData);

            // 2. Fetch Enrollments & Courses
            const { data: enrollmentData } = await supabase
                .from('enrollments')
                .select('*, courses(*)')
                .eq('user_id', user.id);

            if (enrollmentData) {
                setCourses(enrollmentData);

                // Calculate Stats derived from enrollments
                const completedCourses = enrollmentData.filter(e => e.progress_percent === 100).length;
                const inProgress = enrollmentData.length; // Total enrolled

                // 3. Fetch Completed Lessons Count
                const { count } = await supabase
                    .from('completed_lessons')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id);

                setStats({
                    coursesInProgress: inProgress,
                    certificates: completedCourses,
                    lessonsLearned: count || 0
                });
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    return (
        <div className="space-y-8">
            {/* Services Header Row (New) */}
            {services.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-xl font-medium text-white">Explore Services</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {services.map((service) => {
                            const Icon = IconMap[service.icon_name || 'Sparkles'] || Sparkles;
                            const isExternal = service.type === 'link';
                            const path = isExternal ? service.redirect_url : `/student/services/${service.slug}`;

                            const InnerContent = () => (
                                <div className="flex flex-col items-center justify-center p-4 bg-zinc-800/50 hover:bg-zinc-800 border border-white/5 hover:border-primary/50 rounded-xl transition-all group h-full">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                        <Icon size={20} />
                                    </div>
                                    <span className="text-sm text-zinc-300 font-medium text-center">{service.title}</span>
                                    {isExternal && <ExternalLink size={12} className="text-zinc-600 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />}
                                </div>
                            );

                            return isExternal ? (
                                <a key={service.id} href={path} target="_blank" rel="noopener noreferrer" className="block h-28">
                                    <InnerContent />
                                </a>
                            ) : (
                                <Link key={service.id} to={path} className="block h-28">
                                    <InnerContent />
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Courses Enrolled', value: stats.coursesInProgress, icon: BookOpen, color: 'text-blue-500' },
                    { label: 'Lessons Learned', value: stats.lessonsLearned, icon: CheckCircle, color: 'text-primary' },
                    { label: 'Certificates Earned', value: stats.certificates, icon: Award, color: 'text-yellow-500' },
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
                    <h3 className="text-xl font-medium text-white">Your Learning Journey</h3>
                    <Link to="/courses" className="text-sm text-primary hover:text-white transition-colors flex items-center gap-1">
                        Browse Marketplace <BookOpen size={16} />
                    </Link>
                </div>
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-64 bg-zinc-800/50 animate-pulse rounded-xl" />
                        ))}
                    </div>
                ) : courses.length === 0 ? (
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
                                <div className="bg-zinc-900 border border-white/5 rounded-xl overflow-hidden hover:border-primary/50 transition-colors h-full flex flex-col">
                                    <div className="aspect-video bg-zinc-800 relative">
                                        {enrollment.courses.thumbnail_url ? (
                                            <img src={enrollment.courses.thumbnail_url} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-600">No Image</div>
                                        )}
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="px-4 py-2 bg-white text-black rounded-full font-medium">Continue</span>
                                        </div>
                                    </div>
                                    <div className="p-4 flex-1 flex flex-col">
                                        <h4 className="font-medium text-white mb-auto group-hover:text-primary transition-colors line-clamp-2">{enrollment.courses.title}</h4>
                                        <div className="mt-4">
                                            <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary transition-all duration-500"
                                                    style={{ width: `${enrollment.progress_percent}%` }}
                                                />
                                            </div>
                                            <div className="flex justify-between mt-2 text-xs text-zinc-500">
                                                <span>{enrollment.progress_percent}% Complete</span>
                                                {enrollment.progress_percent === 100 && (
                                                    <span className="text-yellow-500 flex items-center gap-1"><Award size={12} /> Certified</span>
                                                )}
                                            </div>
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
