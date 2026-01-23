import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabase';
import { ArrowLeft, Save } from 'lucide-react';
import { Link } from 'react-router-dom';

const CreateCoursePage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        thumbnail_url: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?q=80&w=2013&auto=format&fit=crop',
        slug: ''
    });

    const generateSlug = (title: string) => {
        return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        setFormData(prev => ({
            ...prev,
            title,
            slug: generateSlug(title)
        }));
    };

    const handleSubmit = async (status: 'draft' | 'published') => {
        // e.preventDefault() is not needed as these are type="button" now, or we can keep it if we pass logic differently
        setLoading(true);

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            alert('You must be logged in');
            setLoading(false);
            return;
        }

        const { error } = await supabase
            .from('courses')
            .insert({
                title: formData.title,
                description: formData.description,
                price: parseFloat(formData.price) || 0,
                thumbnail_url: formData.thumbnail_url,
                slug: formData.slug + '-' + Math.floor(Math.random() * 1000), // Ensure uniqueness
                instructor_id: user.id,
                status: status
            });

        if (error) {
            console.error(error);
            alert('Failed to create course. ' + error.message);
        } else {
            navigate('/instructor');
        }
        setLoading(false);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <Link to="/instructor" className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-3xl font-serif text-white">Create New Course</h1>
            </div>

            <div className="bg-zinc-900 border border-white/5 rounded-xl p-8">
                <form className="space-y-6">
                    {/* Title */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400">Course Title</label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={handleTitleChange}
                            className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary/50"
                            placeholder="e.g. Advanced Astrology 101"
                        />
                    </div>

                    {/* Slug (Auto) */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400">URL Slug</label>
                        <div className="flex items-center bg-zinc-800/30 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-500">
                            <span className="text-zinc-600">celestia.app/courses/</span>
                            <span className="text-white ml-1">{formData.slug}</span>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400">Description</label>
                        <textarea
                            required
                            rows={5}
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary/50"
                            placeholder="Describe what students will learn..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Price */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-400">Price ($)</label>
                            <input
                                type="number"
                                required
                                min="0"
                                step="0.01"
                                value={formData.price}
                                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary/50"
                                placeholder="0.00"
                            />
                        </div>

                        {/* Thumbnail */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-400">Thumbnail URL</label>
                            <div className="flex gap-2">
                                <input
                                    type="url"
                                    required
                                    value={formData.thumbnail_url}
                                    onChange={(e) => setFormData(prev => ({ ...prev, thumbnail_url: e.target.value }))}
                                    className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary/50"
                                />
                                <div className="w-12 h-12 bg-zinc-800 rounded-lg border border-zinc-700 overflow-hidden flex-shrink-0">
                                    <img src={formData.thumbnail_url} className="w-full h-full object-cover" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-white/5 flex flex-col md:flex-row gap-4 justify-end">
                        <button
                            type="button"
                            onClick={() => handleSubmit('draft')}
                            disabled={loading}
                            className="px-6 py-2 bg-zinc-800 text-white rounded-lg font-medium hover:bg-zinc-700 transition-colors border border-white/10"
                        >
                            Save as Draft
                        </button>
                        <button
                            type="button"
                            onClick={() => handleSubmit('published')}
                            disabled={loading}
                            className="px-6 py-2 bg-primary text-black rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 justify-center"
                        >
                            {loading ? 'Processing...' : <><Save size={18} /> Publish Course</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateCoursePage;
