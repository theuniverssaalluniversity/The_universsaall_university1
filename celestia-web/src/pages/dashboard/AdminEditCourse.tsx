import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabase';
import { Plus, Trash2, ChevronDown, ArrowLeft, Settings, Image as ImageIcon } from 'lucide-react';

// Admin Course Editor - Allows full editing of metadata and content
const AdminEditCourse = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [modules, setModules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

    // Metadata State (Admin Enhanced)
    const [metadata, setMetadata] = useState({
        title: '',
        description: '',
        price: 0,
        price_inr: 0,
        thumbnail_url: '',
        status: 'draft',
        duration: '',
        certificate: true,
        community_access: true
    });

    const [editingLesson, setEditingLesson] = useState<any>(null);
    const [isAddingModule, setIsAddingModule] = useState(false);
    const [newModuleTitle, setNewModuleTitle] = useState('');

    useEffect(() => {
        if (courseId) {
            fetchCourseData();
        }
    }, [courseId]);

    const fetchCourseData = async () => {
        setLoading(true);
        // 1. Fetch Course (Admin RLS should allow all)
        const { data: courseData, error } = await supabase.from('courses').select('*').eq('id', courseId).single();

        if (error || !courseData) {
            alert('Error loading course');
            navigate('/admin/courses');
            return;
        }

        setMetadata({
            title: courseData.title,
            description: courseData.description || '',
            price: courseData.price,
            price_inr: courseData.price_inr || 0,
            thumbnail_url: courseData.thumbnail_url,
            status: courseData.status,
            duration: courseData.duration || '',
            certificate: courseData.certificate ?? true,
            community_access: courseData.community_access ?? true
        });

        // 2. Fetch Modules & Lessons
        const { data: modulesData } = await supabase
            .from('modules')
            .select('*, lessons(*)')
            .eq('course_id', courseId)
            .order('sort_order');

        if (modulesData) {
            // Sort lessons
            const sorted = modulesData.map((m: any) => ({
                ...m,
                lessons: m.lessons?.sort((a: any, b: any) => a.sort_order - b.sort_order) || []
            }));
            setModules(sorted);
        }
        setLoading(false);
    };

    const handleSaveMetadata = async () => {
        const { error } = await supabase
            .from('courses')
            .update({
                title: metadata.title,
                description: metadata.description,
                price: metadata.price,
                price_inr: metadata.price_inr,
                thumbnail_url: metadata.thumbnail_url,
                duration: metadata.duration,
                certificate: metadata.certificate,
                community_access: metadata.community_access,
                status: metadata.status // Admin can force status
            })
            .eq('id', courseId);

        if (error) alert('Error saving metadata: ' + error.message);
        else {
            alert('Course details updated successfully!');
            fetchCourseData(); // Refresh
        }
    };

    // ... Module/Lesson handlers (reuse logic properly) ...
    const handleSaveLesson = async () => {
        if (!editingLesson || !editingLesson.title) return;

        // Upsert logic same as EditCourseContent
        const payload = {
            module_id: editingLesson.module_id,
            title: editingLesson.title,
            content_type: editingLesson.content_type,
            video_url: editingLesson.video_url,
            text_content: editingLesson.text_content,
            custom_url: editingLesson.custom_url,
            is_free_preview: editingLesson.is_free_preview,
            sort_order: editingLesson.sort_order ?? 999
        };

        let result;
        if (editingLesson.id) {
            result = await supabase.from('lessons').update(payload).eq('id', editingLesson.id);
        } else {
            result = await supabase.from('lessons').insert(payload);
        }

        if (result.error) alert('Error saving lesson');
        else {
            setEditingLesson(null);
            fetchCourseData();
        }
    };

    const deleteModule = async (id: string) => {
        if (!confirm('Delete module?')) return;
        await supabase.from('modules').delete().eq('id', id);
        fetchCourseData();
    };

    const createModule = async () => {
        if (!newModuleTitle) return;
        await supabase.from('modules').insert({ course_id: courseId, title: newModuleTitle, sort_order: modules.length });
        setNewModuleTitle('');
        setIsAddingModule(false);
        fetchCourseData();
    };

    if (loading) return <div className="p-10 text-center text-zinc-500">Loading Admin Editor...</div>;

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/admin/courses')} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-3xl font-serif text-white">Admin Course Editor</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Metadata Editor (Enhanced for Admin) */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-zinc-900 border border-white/5 p-6 rounded-xl space-y-4">
                        <h3 className="text-xl font-medium text-white flex items-center gap-2">
                            <Settings size={20} className="text-primary" /> Course Details
                        </h3>

                        <div>
                            <label className="block text-sm text-zinc-400 mb-1">Title</label>
                            <input className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white"
                                value={metadata.title} onChange={e => setMetadata({ ...metadata, title: e.target.value })} />
                        </div>

                        <div>
                            <label className="block text-sm text-zinc-400 mb-1">Description</label>
                            <textarea className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white h-32"
                                value={metadata.description} onChange={e => setMetadata({ ...metadata, description: e.target.value })} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">Price ($)</label>
                                <input type="number" className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white"
                                    value={metadata.price} onChange={e => setMetadata({ ...metadata, price: Number(e.target.value) })} />
                            </div>
                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">Price (₹)</label>
                                <input type="number" className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white"
                                    value={metadata.price_inr || 0} onChange={e => setMetadata({ ...metadata, price_inr: Number(e.target.value) })} />
                            </div>
                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">Status</label>
                                <select className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white"
                                    value={metadata.status} onChange={e => setMetadata({ ...metadata, status: e.target.value })}>
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                    <option value="archived">Archived</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-zinc-400 mb-1">Thumbnail URL</label>
                            <div className="flex gap-2">
                                <input className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white text-sm"
                                    value={metadata.thumbnail_url} onChange={e => setMetadata({ ...metadata, thumbnail_url: e.target.value })} />
                                <div className="w-10 h-10 bg-zinc-800 rounded flex items-center justify-center overflow-hidden">
                                    {metadata.thumbnail_url ? <img src={metadata.thumbnail_url} className="w-full h-full object-cover" /> : <ImageIcon size={16} />}
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button onClick={handleSaveMetadata} className="w-full py-2 bg-green-500 text-black font-bold rounded hover:bg-green-400">
                                Save Details
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right: Curriculum Editor (Simplified from EditCourseContent) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-serif text-white">Curriculum</h2>
                        <button onClick={() => setIsAddingModule(true)} className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 text-white rounded hover:bg-zinc-700">
                            <Plus size={16} /> Add Module
                        </button>
                    </div>

                    {isAddingModule && (
                        <div className="flex gap-2 mb-4">
                            <input className="flex-1 bg-black border border-white/10 rounded px-3 py-2 text-white"
                                placeholder="Module Title" value={newModuleTitle} onChange={e => setNewModuleTitle(e.target.value)} />
                            <button onClick={createModule} className="bg-primary text-black px-4 rounded font-bold">Add</button>
                        </div>
                    )}

                    <div className="space-y-4">
                        {modules.map((module, idx) => (
                            <div key={module.id} className="border border-white/10 rounded-xl bg-zinc-900/50 overflow-hidden">
                                <div className="p-4 flex items-center justify-between bg-white/5 cursor-pointer" onClick={() => setExpandedModules(prev => ({ ...prev, [module.id]: !prev[module.id] }))}>
                                    <h3 className="font-medium text-white">Module {idx + 1}: {module.title}</h3>
                                    <div className="flex gap-2">
                                        <button onClick={(e) => { e.stopPropagation(); deleteModule(module.id) }} className="text-zinc-500 hover:text-red-400"><Trash2 size={16} /></button>
                                        <ChevronDown size={18} className={`text-zinc-500 transition-transform ${expandedModules[module.id] ? 'rotate-180' : ''}`} />
                                    </div>
                                </div>

                                {expandedModules[module.id] && (
                                    <div className="p-4 space-y-2">
                                        {module.lessons.map((lesson: any) => (
                                            <div key={lesson.id} className="flex justify-between items-center p-3 bg-black/20 rounded border border-white/5">
                                                <div className="flex gap-3 items-center">
                                                    <span className="text-zinc-400 text-xs uppercase w-12">{lesson.content_type}</span>
                                                    <span className="text-zinc-200">{lesson.title}</span>
                                                </div>
                                                <button onClick={() => setEditingLesson(lesson)} className="px-2 py-1 text-xs bg-white/10 rounded hover:bg-white/20">Edit</button>
                                            </div>
                                        ))}
                                        <button onClick={() => setEditingLesson({ module_id: module.id, content_type: 'video' })}
                                            className="w-full py-2 border border-dashed border-zinc-700 text-zinc-500 hover:text-white rounded text-sm">
                                            + Add Lesson
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Lesson Modal (Simplified) */}
            {editingLesson && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <div className="bg-zinc-900 border border-white/10 p-6 rounded-xl w-full max-w-lg space-y-4">
                        <h3 className="text-xl text-white font-bold">{editingLesson.id ? 'Edit Lesson' : 'New Lesson'}</h3>
                        <input className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white"
                            placeholder="Title" value={editingLesson.title || ''} onChange={e => setEditingLesson({ ...editingLesson, title: e.target.value })} />

                        <select className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white"
                            value={editingLesson.content_type} onChange={e => setEditingLesson({ ...editingLesson, content_type: e.target.value })}>
                            <option value="video">Video</option>
                            <option value="text">Text</option>
                            <option value="pdf">PDF</option>
                            <option value="live">Live</option>
                        </select>

                        {editingLesson.content_type === 'video' && (
                            <input className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white"
                                placeholder="Video URL" value={editingLesson.video_url || ''} onChange={e => setEditingLesson({ ...editingLesson, video_url: e.target.value })} />
                        )}
                        {editingLesson.content_type === 'text' && (
                            <textarea className="w-full bg-black border border-white/10 rounded px-3 py-2 text-white h-32"
                                placeholder="Content" value={editingLesson.text_content || ''} onChange={e => setEditingLesson({ ...editingLesson, text_content: e.target.value })} />
                        )}
                        {/* Add other fields as needed */}

                        <div className="flex justify-end gap-2 pt-4">
                            <button onClick={() => setEditingLesson(null)} className="px-4 py-2 bg-zinc-800 text-white rounded">Cancel</button>
                            <button onClick={handleSaveLesson} className="px-4 py-2 bg-primary text-black rounded font-bold">Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminEditCourse;
