import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { PlayCircle, ChevronLeft, Menu, CheckCircle, Lock } from 'lucide-react';
import CustomVideoPlayer from '../components/video/CustomVideoPlayer';
import clsx from 'clsx';

const LearnPage = () => {
    const { courseId } = useParams();
    const [loading, setLoading] = useState(true);
    const [course, setCourse] = useState<any>(null);
    const [modules, setModules] = useState<any[]>([]);
    const [activeLesson, setActiveLesson] = useState<any>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
    const [isEnrolled, setIsEnrolled] = useState(false);

    const handleMarkComplete = async (lessonId: string) => {
        if (!courseId) return;

        // Optimistic UI update
        setCompletedLessons(prev => new Set(prev).add(lessonId));

        const { error } = await supabase.rpc('mark_lesson_complete', {
            p_lesson_id: lessonId,
            p_course_id: courseId
        });

        if (error) console.error('Error marking complete:', error);
    };

    useEffect(() => {
        const fetchCourseContent = async () => {
            if (!courseId) return;

            // 1. Fetch Course Details
            const { data: courseData } = await supabase
                .from('courses')
                .select('*')
                .eq('id', courseId)
                .single();

            setCourse(courseData);

            // 2. Fetch Modules & Lessons
            const { data: modulesData } = await supabase
                .from('modules')
                .select('*, lessons(*)')
                .eq('course_id', courseId)
                .order('sort_order', { ascending: true });

            if (modulesData) {
                // Sort lessons within modules
                const sortedModules = modulesData.map((m: any) => ({
                    ...m,
                    lessons: m.lessons.sort((a: any, b: any) => a.sort_order - b.sort_order)
                }));
                setModules(sortedModules);

                // Set first lesson as active
                if (sortedModules.length > 0 && sortedModules[0].lessons.length > 0) {
                    setActiveLesson(sortedModules[0].lessons[0]);
                }

                // 3. Check Enrollment & Completed Lessons
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    // Check if enrolled
                    const { data: enrollment } = await supabase
                        .from('enrollments')
                        .select('id')
                        .eq('user_id', user.id)
                        .eq('course_id', courseId)
                        .maybeSingle();

                    const isUserEnrolled = !!enrollment;
                    setIsEnrolled(isUserEnrolled);

                    if (isUserEnrolled) {
                        const { data: completedData } = await supabase
                            .from('completed_lessons')
                            .select('lesson_id')
                            .eq('user_id', user.id)
                            .eq('course_id', courseId);

                        if (completedData) {
                            setCompletedLessons(new Set(completedData.map((c: any) => c.lesson_id)));
                        }
                    }
                }
            }

            setLoading(false);
        };
        fetchCourseContent();
    }, [courseId]);

    if (loading) return <div className="h-screen bg-black flex items-center justify-center text-white">Loading Course...</div>;
    if (!course) return <div className="h-screen bg-black flex items-center justify-center text-white">Course not found.</div>;

    return (
        <div className="h-screen flex flex-col md:flex-row bg-black overflow-hidden">
            {/* Sidebar - Playlist */}
            <aside className={clsx(
                "w-full md:w-80 bg-zinc-900 border-r border-white/10 flex flex-col transition-all duration-300 absolute md:static inset-y-0 left-0 z-20 transform",
                sidebarOpen ? "translate-x-0" : "-translate-x-full md:-ml-80"
            )}>
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <Link to="/student" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
                        <ChevronLeft size={20} />
                        <span className="text-sm font-medium">Back to Dashboard</span>
                    </Link>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <div className="p-4">
                        <h2 className="text-lg font-serif text-white mb-1">{course.title}</h2>
                        {isEnrolled && (
                            <>
                                <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-2">
                                    <div
                                        className="bg-primary h-full transition-all duration-500"
                                        style={{ width: `${Math.round((completedLessons.size / Math.max(1, modules.reduce((acc, m) => acc + m.lessons.length, 0))) * 100)}%` }}
                                    />
                                </div>
                                <p className="text-xs text-zinc-500 mt-1">
                                    {Math.round((completedLessons.size / Math.max(1, modules.reduce((acc, m) => acc + m.lessons.length, 0))) * 100)}% Complete
                                </p>
                            </>
                        )}
                        {!isEnrolled && <p className="text-xs text-yellow-500 mt-1">Preview Mode (Not Enrolled)</p>}
                    </div>

                    <div className="space-y-1">
                        {modules.map((module) => (
                            <div key={module.id} className="border-t border-white/5">
                                <div className="px-4 py-3 bg-zinc-900/50 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                    {module.title}
                                </div>
                                <div className="space-y-0.5">
                                    {module.lessons.map((lesson: any) => {
                                        const isLocked = !lesson.is_free_preview && !isEnrolled;

                                        return (
                                            <button
                                                key={lesson.id}
                                                onClick={() => {
                                                    if (!isLocked) setActiveLesson(lesson);
                                                }}
                                                disabled={isLocked}
                                                className={clsx(
                                                    "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
                                                    activeLesson?.id === lesson.id
                                                        ? "bg-primary/20 text-white border-r-2 border-primary"
                                                        : isLocked
                                                            ? "text-zinc-600 cursor-not-allowed"
                                                            : "text-zinc-400 hover:bg-white/5 hover:text-zinc-300"
                                                )}
                                            >
                                                <div className="flex-shrink-0">
                                                    {activeLesson?.id === lesson.id ? (
                                                        <PlayCircle size={16} className="text-primary" />
                                                    ) : isLocked ? (
                                                        <Lock size={14} />
                                                    ) : (
                                                        <div className="w-4 h-4 rounded-full border border-zinc-600" />
                                                    )}
                                                </div>
                                                <span className="text-sm truncate">{lesson.title}</span>
                                                {lesson.is_free_preview && (
                                                    <span className="ml-auto text-[10px] uppercase bg-green-900/40 text-green-400 px-1.5 py-0.5 rounded">Free</span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col relative min-w-0">
                <header className="h-16 border-b border-white/10 bg-zinc-900/50 backdrop-blur flex items-center justify-between px-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg"
                        >
                            <Menu size={20} />
                        </button>
                        <h1 className="text-lg font-medium text-white truncate max-w-xl">
                            {activeLesson?.title || 'Course Intro'}
                        </h1>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-6 md:p-10 flex items-center justify-center bg-black">
                    {activeLesson ? (
                        <div className="w-full max-w-4xl space-y-6">

                            {/* VIDEO Content */}
                            {activeLesson.content_type === 'video' && (
                                <div>
                                    <div className="bg-zinc-900 rounded-xl overflow-hidden border border-white/10 relative group shadow-2xl">
                                        {activeLesson.video_url ? (
                                            <CustomVideoPlayer
                                                url={activeLesson.video_url}
                                                onComplete={() => handleMarkComplete(activeLesson.id)}
                                            />
                                        ) : (
                                            <div className="aspect-video absolute inset-0 flex items-center justify-center flex-col text-zinc-500">
                                                <PlayCircle size={48} className="mb-4 opacity-50" />
                                                <p>No Video Content</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex justify-end mt-4">
                                        <button
                                            onClick={() => handleMarkComplete(activeLesson.id)}
                                            className={clsx(
                                                "px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2",
                                                completedLessons.has(activeLesson.id)
                                                    ? "bg-green-500/10 text-green-400 cursor-default"
                                                    : "bg-primary text-black hover:bg-primary/90"
                                            )}
                                            disabled={completedLessons.has(activeLesson.id)}
                                        >
                                            {completedLessons.has(activeLesson.id) ? (
                                                <>Completed <CheckCircle size={18} /></>
                                            ) : (
                                                'Mark as Completed'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* LIVE Content */}
                            {activeLesson.content_type === 'live' && (
                                <div className="bg-zinc-900 border border-t border-primary/50 rounded-xl p-8 text-center space-y-6 shadow-2xl shadow-primary/10">
                                    <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto text-primary animate-pulse">
                                        <div className="w-3 h-3 bg-red-500 rounded-full absolute top-2 right-2 animate-ping" />
                                        <Menu size={32} />
                                    </div>

                                    <div>
                                        <h2 className="text-2xl font-bold text-white mb-2">Live Class Session</h2>
                                        {activeLesson.metadata?.live_date && (
                                            <p className="text-xl text-primary font-serif">
                                                {new Date(activeLesson.metadata.live_date).toLocaleDateString()} @ {activeLesson.metadata.live_time}
                                            </p>
                                        )}
                                        <p className="text-zinc-400 max-w-md mx-auto mt-4">
                                            Join the instructor for a live interactive session. Please be on time.
                                        </p>
                                    </div>

                                    <div className="pt-4 flex flex-col items-center gap-4">
                                        <a
                                            href={activeLesson.custom_url || '#'}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-black rounded-lg font-bold hover:bg-primary/90 transition-transform hover:scale-105"
                                        >
                                            <PlayCircle size={20} /> Join Live Class
                                        </a>
                                        <button
                                            onClick={() => handleMarkComplete(activeLesson.id)}
                                            className="text-sm text-zinc-500 hover:text-white underline underline-offset-4"
                                        >
                                            Mark as Attended
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* PDF Content */}
                            {activeLesson.content_type === 'pdf' && (
                                <div className="bg-zinc-900 border border-white/10 rounded-xl p-8 flex flex-col items-center justify-center text-center space-y-6">
                                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-zinc-400">
                                        <Menu size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Course Material</h3>
                                        <p className="text-zinc-400 mt-2">Download or view the attached document for this lesson.</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <a
                                            href={activeLesson.custom_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="px-6 py-2.5 bg-white text-black rounded-lg font-medium hover:bg-zinc-200 transition-colors"
                                            onClick={() => handleMarkComplete(activeLesson.id)}
                                        >
                                            Open Document
                                        </a>
                                    </div>
                                </div>
                            )}

                            {/* TEXT Content */}
                            <div className="prose prose-invert max-w-none">
                                <h1 className="text-3xl font-serif text-white mb-4">{activeLesson.title}</h1>
                                {activeLesson.text_content && (
                                    <div className="text-zinc-300 leading-relaxed whitespace-pre-wrap">
                                        {activeLesson.text_content}
                                    </div>
                                )}
                                {activeLesson.content_type === 'text' && (
                                    <div className="pt-8 flex justify-end">
                                        <button
                                            onClick={() => handleMarkComplete(activeLesson.id)}
                                            className={clsx(
                                                "px-6 py-2.5 rounded-lg font-medium transition-colors border",
                                                completedLessons.has(activeLesson.id)
                                                    ? "bg-green-500/10 text-green-400 border-green-500/20 cursor-default"
                                                    : "bg-transparent text-white border-white/20 hover:bg-white/10"
                                            )}
                                            disabled={completedLessons.has(activeLesson.id)}
                                        >
                                            {completedLessons.has(activeLesson.id) ? 'Completed' : 'Mark as Read'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="text-zinc-500">Select a lesson to start learning</div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default LearnPage;
