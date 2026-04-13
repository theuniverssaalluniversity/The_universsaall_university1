import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../../utils/supabase'; // Correct import path
import { Plus, Trash2, Save, Video, FileText, File, Radio, ChevronDown, ChevronRight, ArrowLeft, Settings } from 'lucide-react';

// Types for our data
type Course = {
    id: string;
    title: string;
    status: string;
};

type Module = {
    id: string;
    title: string;
    sort_order: number;
    lessons: Lesson[];
};

type Lesson = {
    id: string;
    module_id: string;
    title: string;
    content_type: 'video' | 'text' | 'pdf' | 'live';
    video_url?: string;
    text_content?: string;
    custom_url?: string; // For PDF/Live
    is_free_preview: boolean;
    sort_order: number;
    metadata?: {
        live_date?: string;
        live_time?: string;
        [key: string]: any;
    };
};

const EditCourseContent = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState<Course | null>(null);
    const [modules, setModules] = useState<Module[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

    // Form states for new/editing
    const [isAddingModule, setIsAddingModule] = useState(false);
    const [newModuleTitle, setNewModuleTitle] = useState('');

    // Editing lesson state
    const [editingLesson, setEditingLesson] = useState<Partial<Lesson> | null>(null);

    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [courseSettings, setCourseSettings] = useState({
        duration: '',
        certificate: true,
        community_access: true
    });

    const [performance, setPerformance] = useState({ students: 0, revenue: 0 });

    useEffect(() => {
        if (courseId) {
            fetchCourseData();
            fetchPerformance();
        }
    }, [courseId]);

    const fetchPerformance = async () => {
        if (!courseId) return;

        // 1. Enrollments Count
        const { count } = await supabase
            .from('enrollments')
            .select('*', { count: 'exact', head: true })
            .eq('course_id', courseId);

        // 2. Revenue (from Order Items)
        const { data: sales } = await supabase
            .from('order_items')
            .select('price')
            .eq('item_type', 'course')
            .eq('item_id', courseId);

        const totalRevenue = sales?.reduce((sum, item) => sum + (item.price || 0), 0) || 0;

        setPerformance({
            students: count || 0,
            revenue: totalRevenue
        });
    };

    const fetchCourseData = async () => {
        if (!courseId) return;
        setLoading(true);

        // 1. Fetch Course Info
        const { data: courseData, error: courseError } = await supabase
            .from('courses')
            .select('*')
            .eq('id', courseId)
            .single();

        if (courseError) {
            console.error('Error fetching course:', courseError);
            return;
        }
        setCourse(courseData);
        setCourseSettings({
            duration: courseData.duration || '',
            certificate: courseData.certificate ?? true,
            community_access: courseData.community_access ?? true
        });

        // 2. Fetch Modules
        const { data: modulesData, error: modulesError } = await supabase
            .from('modules')
            .select('*')
            .eq('course_id', courseId)
            .order('sort_order', { ascending: true });

        if (modulesError) {
            console.error('Error fetching modules:', modulesError);
            return;
        }

        // 3. Fetch Lessons for all modules
        // Note: In a larger app, we might fetch only when expanding, but this is simpler for now
        const moduleIds = modulesData.map(m => m.id);
        const { data: lessonsData, error: lessonsError } = await supabase
            .from('lessons')
            .select('*')
            .in('module_id', moduleIds)
            .order('sort_order', { ascending: true });

        if (lessonsError) {
            console.error('Error fetching lessons:', lessonsError);
        }

        // Combine data
        const combinedModules = modulesData.map(m => ({
            ...m,
            lessons: lessonsData?.filter(l => l.module_id === m.id) || []
        }));

        setModules(combinedModules);
        setLoading(false);
    };

    const handleSaveSettings = async () => {
        const { error } = await supabase
            .from('courses')
            .update({
                duration: courseSettings.duration,
                certificate: courseSettings.certificate,
                community_access: courseSettings.community_access
            })
            .eq('id', courseId);

        if (error) {
            alert('Error updating settings');
        } else {
            alert('Settings updated!');
            setIsSettingsOpen(false);
            fetchCourseData();
        }
    };

    const handleCreateModule = async () => {
        if (!newModuleTitle.trim() || !courseId) return;

        const { data, error } = await supabase
            .from('modules')
            .insert({
                course_id: courseId,
                title: newModuleTitle,
                sort_order: modules.length // Append to end
            })
            .select()
            .single();

        if (error) {
            alert('Error creating module');
            console.error(error);
        } else {
            setModules([...modules, { ...data, lessons: [] }]);
            setNewModuleTitle('');
            setIsAddingModule(false);
        }
    };

    const handleDeleteModule = async (moduleId: string) => {
        if (!confirm('Delete this module and all its lessons?')) return;

        const { error } = await supabase
            .from('modules')
            .delete()
            .eq('id', moduleId);

        if (error) {
            alert('Error deleting module');
        } else {
            setModules(modules.filter(m => m.id !== moduleId));
        }
    };

    const handleSaveLesson = async () => {
        if (!editingLesson || !editingLesson.title || !editingLesson.module_id) return;

        const lessonData = {
            module_id: editingLesson.module_id,
            title: editingLesson.title,
            content_type: editingLesson.content_type,
            video_url: editingLesson.video_url,
            text_content: editingLesson.text_content,
            custom_url: editingLesson.custom_url, // For PDF/Live links
            is_free_preview: editingLesson.is_free_preview,
            sort_order: editingLesson.sort_order ?? 0
        };

        let result;
        if (editingLesson.id) {
            // Update
            result = await supabase
                .from('lessons')
                .update(lessonData)
                .eq('id', editingLesson.id)
                .select()
                .single();
        } else {
            // Insert
            // Calculate sort order if not set (append to end of module)
            if (lessonData.sort_order === 0) {
                const module = modules.find(m => m.id === lessonData.module_id);
                if (module) lessonData.sort_order = module.lessons.length;
            }

            result = await supabase
                .from('lessons')
                .insert(lessonData)
                .select()
                .single();
        }

        if (result.error) {
            console.error(result.error);
            alert('Error saving lesson: ' + result.error.message);
        } else {
            // Refresh local state
            fetchCourseData(); // Simpler to just re-fetch to keep sort orders compliant
            setEditingLesson(null);
        }
    };

    const handleDeleteLesson = async (lessonId: string) => {
        if (!confirm('Delete this lesson?')) return;
        const { error } = await supabase
            .from('lessons')
            .delete()
            .eq('id', lessonId);

        if (error) alert('Error deleting lesson');
        else fetchCourseData();
    };

    const toggleModule = (id: string) => {
        setExpandedModules(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handlePublishCourse = async () => {
        if (!confirm('Are you ready to publish this course? It will become visible to students.')) return;
        const { error } = await supabase
            .from('courses')
            .update({ status: 'published' })
            .eq('id', courseId);

        if (error) {
            alert('Error publishing course');
        } else {
            alert('Course published successfully!');
            setCourse(prev => prev ? { ...prev, status: 'published' } : null);
        }
    };

    if (loading) return <div className="p-10 text-center text-zinc-500">Loading course content...</div>;

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/instructor/courses')} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                                {course?.title}
                            </h1>
                            <span className={`px-2 py-0.5 text-xs rounded-full border ${course?.status === 'published' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                                {course?.status?.toUpperCase()}
                            </span>
                        </div>
                        <p className="text-zinc-500">Content & Curriculum</p>
                    </div>
                </div>

                {course?.status === 'draft' && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsSettingsOpen(true)}
                            className="p-2.5 bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-colors border border-white/10"
                            title="Course Settings"
                        >
                            <Settings size={20} />
                        </button>
                        <button
                            onClick={handlePublishCourse}
                            className="px-6 py-2 bg-primary text-black rounded-lg font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 flex items-center gap-2"
                        >
                            <Save size={18} /> Publish Course
                        </button>
                    </div>
                )}
            </div>

            {/* Course Performance Section (Mandatory) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-zinc-900 border border-white/10 p-4 rounded-xl">
                    <div className="text-zinc-500 text-sm mb-1">Total Students</div>
                    <div className="text-2xl font-bold text-white">{performance.students}</div>
                </div>
                <div className="bg-zinc-900 border border-white/10 p-4 rounded-xl">
                    <div className="text-zinc-500 text-sm mb-1">Total Revenue</div>
                    <div className="text-2xl font-bold text-green-400">${performance.revenue.toFixed(2)}</div>
                </div>
                <div className="bg-zinc-900 border border-white/10 p-4 rounded-xl">
                    <div className="text-zinc-500 text-sm mb-1">Course Rating</div>
                    <div className="text-2xl font-bold text-yellow-400 flex items-center gap-2">
                        4.8 <span className="text-xs text-zinc-600 font-normal">(12 reviews)</span>
                    </div>
                </div>
            </div>

            {/* Modules List */}
            <div className="space-y-4">
                {modules.map((module, index) => (
                    <div key={module.id} className="border border-white/10 rounded-xl bg-black/40 overflow-hidden">
                        {/* Module Header */}
                        <div className="p-4 bg-white/5 flex items-center justify-between group">
                            <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => toggleModule(module.id)}>
                                {expandedModules[module.id] ? <ChevronDown size={18} className="text-zinc-500" /> : <ChevronRight size={18} className="text-zinc-500" />}
                                <span className="font-semibold text-zinc-200">Module {index + 1}: {module.title}</span>
                                <span className="text-xs text-zinc-500 bg-black/50 px-2 py-0.5 rounded-full">{module.lessons.length} Lessons</span>
                            </div>
                            <button
                                onClick={() => handleDeleteModule(module.id)}
                                className="p-1.5 text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>

                        {/* Lessons List (only if expanded) */}
                        {expandedModules[module.id] && (
                            <div className="p-4 border-t border-white/5 space-y-3">
                                {module.lessons.length === 0 && (
                                    <div className="text-center py-4 text-zinc-600 text-sm italic">No lessons yet.</div>
                                )}

                                {module.lessons.map((lesson) => (
                                    <div key={lesson.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50 hover:bg-zinc-900 border border-white/5 transition-colors">
                                        <div className="flex items-center gap-3">
                                            {/* Icon based on Type */}
                                            <div className="p-2 bg-white/5 rounded-lg text-zinc-400">
                                                {lesson.content_type === 'video' && <Video size={16} />}
                                                {lesson.content_type === 'text' && <FileText size={16} />}
                                                {lesson.content_type === 'pdf' && <File size={16} />}
                                                {lesson.content_type === 'live' && <Radio size={16} />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-zinc-200">{lesson.title}</p>
                                                <p className="text-xs text-zinc-500 capitalize">{lesson.content_type}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setEditingLesson(lesson)}
                                                className="px-3 py-1 text-xs bg-white/5 hover:bg-white/10 rounded-md transition-colors"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteLesson(lesson.id)}
                                                className="p-1.5 text-zinc-600 hover:text-red-400 transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {/* Add Lesson Button */}
                                <button
                                    onClick={() => {
                                        setEditingLesson({ module_id: module.id, content_type: 'video', is_free_preview: false, sort_order: module.lessons.length });
                                    }}
                                    className="w-full py-2 mt-2 border border-dashed border-zinc-700 text-zinc-500 hover:text-zinc-300 hover:border-zinc-500 rounded-lg text-sm transition-all flex items-center justify-center gap-2"
                                >
                                    <Plus size={16} /> Add Lesson
                                </button>
                            </div>
                        )}
                    </div>
                ))}

                {/* Create Module Section */}
                {isAddingModule ? (
                    <div className="bg-zinc-900/50 border border-white/10 p-4 rounded-xl flex gap-2">
                        <input
                            type="text"
                            placeholder="Module Title"
                            value={newModuleTitle}
                            onChange={(e) => setNewModuleTitle(e.target.value)}
                            className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary/50"
                        />
                        <button onClick={handleCreateModule} className="bg-primary text-black px-4 py-2 rounded-lg font-medium hover:bg-primary/90">Add</button>
                        <button onClick={() => setIsAddingModule(false)} className="bg-zinc-800 text-white px-4 py-2 rounded-lg font-medium hover:bg-zinc-700">Cancel</button>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsAddingModule(true)}
                        className="w-full py-4 border border-dashed border-zinc-700 text-zinc-500 hover:text-white hover:border-primary hover:bg-primary/5 rounded-xl transition-all flex items-center justify-center gap-2 font-medium"
                    >
                        <Plus size={20} /> Create New Module
                    </button>
                )}
            </div>

            {/* Edit/Create Lesson Modal Overlays */}
            {editingLesson && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-lg space-y-6 relative shadow-2xl">
                        <h2 className="text-xl font-bold text-white">{editingLesson.id ? 'Edit Lesson' : 'New Lesson'}</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={editingLesson.title || ''}
                                    onChange={(e) => setEditingLesson({ ...editingLesson, title: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary/50"
                                    placeholder="Lesson Title"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-zinc-400 mb-2">Content Type</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {['video', 'text', 'pdf', 'live'].map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => setEditingLesson({ ...editingLesson, content_type: type as any })}
                                            className={`py-2 px-1 rounded-lg text-sm border transition-all ${editingLesson.content_type === type
                                                ? 'bg-primary text-black border-primary font-bold'
                                                : 'bg-black/30 text-zinc-400 border-transparent hover:bg-white/5'
                                                }`}
                                        >
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Dynamic Fields based on Type */}
                            {editingLesson.content_type === 'video' && (
                                <div>
                                    <label className="block text-sm text-zinc-400 mb-1">Video URL (YouTube/Vimeo)</label>
                                    <input
                                        type="text"
                                        value={editingLesson.video_url || ''}
                                        onChange={(e) => setEditingLesson({ ...editingLesson, video_url: e.target.value })}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary/50"
                                        placeholder="https://..."
                                    />
                                </div>
                            )}

                            {editingLesson.content_type === 'text' && (
                                <div>
                                    <label className="block text-sm text-zinc-400 mb-1">Content</label>
                                    <textarea
                                        value={editingLesson.text_content || ''}
                                        onChange={(e) => setEditingLesson({ ...editingLesson, text_content: e.target.value })}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary/50 h-32"
                                        placeholder="Write your lesson content here..."
                                    />
                                </div>
                            )}

                            {['pdf', 'live'].includes(editingLesson.content_type || '') && (
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm text-zinc-400 mb-1">
                                            {editingLesson.content_type === 'pdf' ? 'PDF Link (Google Drive/Dropbox)' : 'Meeting Link (Zoom/Meet)'}
                                        </label>
                                        <input
                                            type="text"
                                            value={editingLesson.custom_url || ''}
                                            onChange={(e) => setEditingLesson({ ...editingLesson, custom_url: e.target.value })}
                                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary/50"
                                            placeholder="https://..."
                                        />
                                    </div>

                                    {editingLesson.content_type === 'live' && (
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-sm text-zinc-400 mb-1">Class Date</label>
                                                <input
                                                    type="date"
                                                    value={editingLesson.metadata?.live_date || ''}
                                                    onChange={(e) => setEditingLesson({
                                                        ...editingLesson,
                                                        metadata: { ...editingLesson.metadata, live_date: e.target.value }
                                                    })}
                                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary/50"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-zinc-400 mb-1">Class Time</label>
                                                <input
                                                    type="time"
                                                    value={editingLesson.metadata?.live_time || ''}
                                                    onChange={(e) => setEditingLesson({
                                                        ...editingLesson,
                                                        metadata: { ...editingLesson.metadata, live_time: e.target.value }
                                                    })}
                                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary/50"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_free_preview"
                                    checked={editingLesson.is_free_preview}
                                    onChange={(e) => setEditingLesson({ ...editingLesson, is_free_preview: e.target.checked })}
                                    className="w-4 h-4 rounded bg-black/50 border-white/10"
                                />
                                <label htmlFor="is_free_preview" className="text-sm text-zinc-300">Allow as Free Preview</label>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={handleSaveLesson}
                                className="flex-1 bg-primary text-black py-2.5 rounded-lg font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                            >
                                <Save size={18} /> Save Lesson
                            </button>
                            <button
                                onClick={() => setEditingLesson(null)}
                                className="px-6 py-2.5 bg-zinc-800 text-white rounded-lg font-medium hover:bg-zinc-700 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Course Settings Modal */}
            {isSettingsOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-lg space-y-6 relative shadow-2xl">
                        <h2 className="text-xl font-bold text-white">Course Settings</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">Duration (e.g. "12 Hours")</label>
                                <input
                                    type="text"
                                    value={courseSettings.duration || ''}
                                    onChange={(e) => setCourseSettings({ ...courseSettings, duration: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary/50"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="certificate"
                                    checked={courseSettings.certificate}
                                    onChange={(e) => setCourseSettings({ ...courseSettings, certificate: e.target.checked })}
                                    className="w-4 h-4 rounded bg-black/50 border-white/10"
                                />
                                <label htmlFor="certificate" className="text-sm text-zinc-300">Certificate of Completion</label>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="community_access"
                                    checked={courseSettings.community_access}
                                    onChange={(e) => setCourseSettings({ ...courseSettings, community_access: e.target.checked })}
                                    className="w-4 h-4 rounded bg-black/50 border-white/10"
                                />
                                <label htmlFor="community_access" className="text-sm text-zinc-300">Community Access</label>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={handleSaveSettings}
                                className="flex-1 bg-primary text-black py-2.5 rounded-lg font-bold hover:bg-primary/90 transition-colors"
                            >
                                Save Changes
                            </button>
                            <button
                                onClick={() => setIsSettingsOpen(false)}
                                className="px-6 py-2.5 bg-zinc-800 text-white rounded-lg font-medium hover:bg-zinc-700 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditCourseContent;
