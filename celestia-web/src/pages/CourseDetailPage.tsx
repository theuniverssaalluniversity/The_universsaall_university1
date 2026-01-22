import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { Clock, Users, Star, PlayCircle, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

interface CourseDetail {
    id: string;
    title: string;
    description: string;
    thumbnail_url: string;
    price: number;
}

const CourseDetailPage = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState<CourseDetail & { id: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [enrolled, setEnrolled] = useState(false);
    const [enrolling, setEnrolling] = useState(false);

    useEffect(() => {
        const fetchCourse = async () => {
            // Fetch current user and enrollments first to check
            const { data: { user } } = await supabase.auth.getUser();

            if (!slug) return;

            const { data: courseData, error } = await supabase
                .from('courses')
                .select('*')
                .eq('slug', slug)
                .single();

            if (!error && courseData) {
                setCourse(courseData);

                // Check enrollment status
                if (user) {
                    const { data: enrollment } = await supabase
                        .from('enrollments')
                        .select('id')
                        .eq('user_id', user.id)
                        .eq('course_id', courseData.id)
                        .single();

                    if (enrollment) setEnrolled(true);
                }
            }
            setLoading(false);
        };

        fetchCourse();
    }, [slug]);

    const handleEnroll = async () => {
        if (!course) return;

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            navigate('/login');
            return;
        }

        setEnrolling(true);

        // Check if already enrolled (double check)
        if (enrolled) {
            navigate('/student'); // Or /learn/${course.id}
            return;
        }

        // Create Enrollment
        const { error } = await supabase
            .from('enrollments')
            .insert({
                user_id: user.id,
                course_id: course.id,
                progress_percent: 0
            });

        if (error) {
            console.error('Enrollment Failed:', error);
            alert('Failed to enroll. Please try again.');
        } else {
            navigate(`/learn/${course.id}`);
        }
        setEnrolling(false);
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
        </div>
    );

    if (!course) return <div className="min-h-screen flex items-center justify-center text-zinc-500">Course not found</div>;

    return (
        <div className="min-h-screen pb-20">
            {/* Hero Header */}
            <div className="relative h-[50vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0">
                    {course.thumbnail_url && (
                        <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover opacity-30 blur-sm" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-black/50" />
                </div>

                <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-serif text-white mb-6"
                    >
                        {course.title}
                    </motion.h1>
                    <div className="flex items-center justify-center gap-6 text-zinc-300 mb-8">
                        <span className="flex items-center gap-2"><Users size={16} /> 1.2k Enrolled</span>
                        <span className="flex items-center gap-2"><Star size={16} className="text-yellow-500" /> 4.8/5</span>
                        <span className="flex items-center gap-2"><Clock size={16} /> 12h 30m</span>
                    </div>
                    {enrolled ? (
                        <button
                            onClick={() => navigate(`/learn/${course.id}`)}
                            className="px-8 py-4 bg-green-500/10 text-green-500 border border-green-500/50 rounded-full font-medium text-lg hover:bg-green-500/20 transition-all shadow-lg shadow-green-500/10 flex items-center gap-2 mx-auto"
                        >
                            <PlayCircle size={20} /> Continue Learning
                        </button>
                    ) : (
                        <button
                            onClick={handleEnroll}
                            disabled={enrolling}
                            className="px-8 py-4 bg-primary text-black rounded-full font-medium text-lg hover:bg-primary/90 transition-transform hover:scale-105 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {enrolling ? 'Enrolling...' : `Enroll Now for $${course.price}`}
                        </button>
                    )}
                </div>
            </div>

            {/* Content Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-12">
                    <section>
                        <h2 className="text-2xl font-serif text-white mb-6">About this Course</h2>
                        <div className="prose prose-invert text-zinc-400 leading-relaxed max-w-none">
                            {course.description}
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif text-white mb-6">Syllabus Preview</h2>
                        <div className="space-y-4">
                            {/* Assuming existing mock logic or future module fetching */}
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between group hover:border-primary/30 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-primary">
                                            <PlayCircle size={20} />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-medium">Module {i}: Foundations of The Stars</h4>
                                            <p className="text-sm text-zinc-500">2 Lessons • 45 mins</p>
                                        </div>
                                    </div>
                                    <Lock size={16} className="text-zinc-600" />
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 sticky top-24 backdrop-blur-xl">
                        <h3 className="text-xl font-serif text-white mb-6">Features</h3>
                        <ul className="space-y-4 text-zinc-400">
                            <li className="flex items-center gap-3"><PlayCircle size={18} className="text-primary" /> 12 Hours of Video</li>
                            <li className="flex items-center gap-3"><Users size={18} className="text-primary" /> Community Access</li>
                            <li className="flex items-center gap-3"><Star size={18} className="text-primary" /> Certificate of Completion</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDetailPage;
