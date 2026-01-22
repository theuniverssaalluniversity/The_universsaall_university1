import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { PlayCircle, ChevronLeft, Menu } from 'lucide-react';
import clsx from 'clsx';

const LearnPage = () => {
    const { courseId } = useParams();
    const [loading, setLoading] = useState(true);
    const [course, setCourse] = useState<any>(null);
    const [modules, setModules] = useState<any[]>([]);
    const [activeLesson, setActiveLesson] = useState<any>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);

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
            // In a real app, we'd use a single query with joins, but for simplicity:
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
                        <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-2">
                            <div className="bg-primary h-full w-[0%]" />
                        </div>
                        <p className="text-xs text-zinc-500 mt-1">0% Complete</p>
                    </div>

                    <div className="space-y-1">
                        {modules.map((module) => (
                            <div key={module.id} className="border-t border-white/5">
                                <div className="px-4 py-3 bg-zinc-900/50 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                    {module.title}
                                </div>
                                <div className="space-y-0.5">
                                    {module.lessons.map((lesson: any) => (
                                        <button
                                            key={lesson.id}
                                            onClick={() => setActiveLesson(lesson)}
                                            className={clsx(
                                                "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
                                                activeLesson?.id === lesson.id
                                                    ? "bg-primary/20 text-white border-r-2 border-primary"
                                                    : "text-zinc-400 hover:bg-white/5 hover:text-zinc-300"
                                            )}
                                        >
                                            {activeLesson?.id === lesson.id ? (
                                                <PlayCircle size={16} className="text-primary flex-shrink-0" />
                                            ) : (
                                                <div className="w-4 h-4 rounded-full border border-zinc-600 flex-shrink-0" />
                                            )}
                                            <span className="text-sm truncate">{lesson.title}</span>
                                        </button>
                                    ))}
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
                    {/* Next Button Logic would go here */}
                </header>

                <div className="flex-1 overflow-y-auto p-6 md:p-10 flex items-center justify-center bg-black">
                    {activeLesson ? (
                        <div className="w-full max-w-4xl space-y-6">
                            {/* Video Player Placeholder */}
                            <div className="aspect-video bg-zinc-900 rounded-xl overflow-hidden border border-white/10 relative group">
                                {activeLesson.video_url ? (
                                    <iframe
                                        src={activeLesson.video_url.replace('watch?v=', 'embed/')}
                                        className="w-full h-full"
                                        allowFullScreen
                                        title={activeLesson.title}
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center flex-col text-zinc-500">
                                        <PlayCircle size={48} className="mb-4 opacity-50" />
                                        <p>No Video Content</p>
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="prose prose-invert max-w-none">
                                <h2 className="text-2xl font-serif text-white">{activeLesson.title}</h2>
                                <p className="text-zinc-400 mt-4">{activeLesson.text_content || 'No text content available for this lesson.'}</p>
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
