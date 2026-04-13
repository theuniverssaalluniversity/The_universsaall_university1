import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase';
import { Plus, Trash2, Edit2, Sparkles, Settings, ExternalLink } from 'lucide-react';

interface ServiceCategory {
    id: string;
    title: string;
    slug: string;
    type?: 'page' | 'link';
    redirect_url?: string;
    description?: string;
    icon_name?: string;
    parent_id?: string;
}

interface Service {
    id: string;
    title: string;
    description: string;
    price: number;
    price_inr?: number;
    duration_minutes: number;
    thumbnail_url?: string;
    category_id?: string;
    display_mode?: 'content' | 'redirect';
    redirect_url?: string;
    is_visible?: boolean; // Visibility Flag
    requires_birth_details?: boolean;
    // Legacy type support for display only
    type?: string;
}

const AdminServices = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [categories, setCategories] = useState<ServiceCategory[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    // const [loading, setLoading] = useState(true);

    // Category Management
    const [isManageCategories, setIsManageCategories] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [editingCategory, setEditingCategory] = useState<Partial<ServiceCategory> & { is_visible?: boolean } | null>(null);

    const [formData, setFormData] = useState<Partial<Service>>({
        title: '', description: '', price: 0, price_inr: 0, duration_minutes: 60, thumbnail_url: '',
        display_mode: 'content', redirect_url: '', is_visible: true, requires_birth_details: false
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        // setLoading(true);
        const { data: servicesData } = await supabase.from('services').select('*').order('created_at', { ascending: false });
        const { data: categoriesData } = await supabase.from('service_categories').select('*').order('sort_order');

        if (servicesData) setServices(servicesData);
        if (categoriesData) setCategories(categoriesData);
        // setLoading(false);
    };

    const handleAddCategory = async () => {
        if (!newCategoryName.trim()) return;
        const slug = newCategoryName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');

        const { error } = await supabase.from('service_categories').insert({
            title: newCategoryName,
            slug: slug,
            type: 'page', // Default
            sort_order: categories.length,
            is_visible: true
        });

        if (error) {
            console.error('Add Category Error:', error);
            alert('Error creating category: ' + error.message);
        }
        else {
            setNewCategoryName('');
            fetchData();
        }
    };

    const handleUpdateCategory = async () => {
        if (!editingCategory || !editingCategory.id) return;

        const { error } = await supabase.from('service_categories').update({
            title: editingCategory.title,
            type: editingCategory.type || 'page',
            redirect_url: editingCategory.redirect_url,
            description: editingCategory.description,
            icon_name: editingCategory.icon_name,
            parent_id: editingCategory.parent_id || null,
            is_visible: editingCategory.is_visible
        }).eq('id', editingCategory.id);

        if (error) alert('Error updating category: ' + error.message);
        else {
            setEditingCategory(null);
            fetchData();
        }
    };

    const handleDeleteCategory = async (id: string) => {
        if (!confirm('Are you sure? Deleting a category will not delete the services, but they will become uncategorized.')) return;

        const { error } = await supabase.from('service_categories').delete().eq('id', id);

        if (error) alert('Error deleting category: ' + error.message);
        else {
            if (editingCategory?.id === id) setEditingCategory(null);
            fetchData();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Ensure category is set
        if (!formData.category_id && categories.length > 0) {
            alert('Please select a category');
            return;
        }

        const { error } = await supabase.from('services').upsert(formData).select();
        if (!error) {
            setIsEditing(false);
            setFormData({
                title: '', description: '', price: 0, price_inr: 0, duration_minutes: 60, thumbnail_url: '',
                display_mode: 'content', redirect_url: '', is_visible: true
            });
            fetchData();
        } else {
            alert('Error saving service: ' + error.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        const { error } = await supabase.from('services').delete().eq('id', id);
        if (!error) fetchData();
    };

    return (
        <div className="space-y-8">
            {/* Header ... */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-serif text-white">Services Management</h1>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsManageCategories(!isManageCategories)}
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-800 text-white rounded-lg font-medium hover:bg-zinc-700 transition-colors"
                    >
                        <Settings size={18} /> Categories
                    </button>
                    <button
                        onClick={() => { setIsEditing(true); setFormData({ category_id: categories[0]?.id || '', display_mode: 'content', is_visible: true }); }}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-black rounded-lg font-bold hover:bg-primary/90 transition-colors"
                    >
                        <Plus size={18} /> Add Service
                    </button>
                </div>
            </div>

            {/* Category Manager */}
            {isManageCategories && (
                <div className="bg-zinc-900 border border-white/10 p-6 rounded-xl animate-fade-in mb-6">
                    <h3 className="text-lg font-medium text-white mb-4">Manage Service Categories (Navbar Items)</h3>

                    {/* Add New */}
                    <div className="flex gap-4 mb-6 pb-6 border-b border-white/5">
                        <input
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="New Category Name (e.g. Workshops)"
                            className="flex-1 bg-black border border-white/10 rounded-lg px-4 py-2 text-white"
                        />
                        <button onClick={handleAddCategory} className="bg-primary text-black px-4 py-2 rounded-lg font-bold">Add</button>
                    </div>

                    {/* Edit Existing */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {categories.map(cat => (
                            <div key={cat.id} className={`border p-4 rounded-lg flex flex-col gap-3 ${((cat as any).is_visible === false) ? 'bg-red-900/10 border-red-500/30' : 'bg-black/40 border-white/5'}`}>
                                {editingCategory?.id === cat.id ? (
                                    <>
                                        <label className="text-xs text-zinc-500">Title</label>
                                        <input
                                            value={editingCategory.title}
                                            onChange={e => setEditingCategory({ ...editingCategory, title: e.target.value })}
                                            className="bg-zinc-800 border border-white/10 rounded px-2 py-1 text-white text-sm w-full"
                                        />

                                        <div className="grid grid-cols-2 gap-2">
                                            {/* (Icon and Parent selectors remain same) */}
                                            <div>
                                                <label className="text-xs text-zinc-500">Icon</label>
                                                <select
                                                    value={editingCategory.icon_name || 'Sparkles'}
                                                    onChange={e => setEditingCategory({ ...editingCategory, icon_name: e.target.value })}
                                                    className="bg-zinc-800 border border-white/10 rounded px-2 py-1 text-white text-sm w-full"
                                                >
                                                    <option value="Sparkles">Sparkles</option>
                                                    {/* ... options ... */}
                                                    <option value="Heart">Heart</option>
                                                    <option value="Star">Star</option>
                                                    <option value="Moon">Moon</option>
                                                    <option value="Sun">Sun</option>
                                                    <option value="Zap">Zap</option>
                                                    <option value="BookOpen">BookOpen</option>
                                                    <option value="Feather">Feather</option>
                                                    <option value="Eye">Eye</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-xs text-zinc-500">Parent Parent</label>
                                                <select
                                                    value={editingCategory.parent_id || ''}
                                                    onChange={e => setEditingCategory({ ...editingCategory, parent_id: e.target.value || undefined })}
                                                    className="bg-zinc-800 border border-white/10 rounded px-2 py-1 text-white text-sm w-full"
                                                >
                                                    <option value="">No Parent (Top Level)</option>
                                                    {categories.filter(c => c.id !== editingCategory.id).map(c => (
                                                        <option key={c.id} value={c.id}>{c.title}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 mt-2">
                                            <input
                                                type="checkbox"
                                                id={`vis-${cat.id}`}
                                                checked={editingCategory.is_visible !== false}
                                                onChange={e => setEditingCategory({ ...editingCategory, is_visible: e.target.checked })}
                                            />
                                            <label htmlFor={`vis-${cat.id}`} className="text-xs text-zinc-400">Show on Student Dashboard</label>
                                        </div>

                                        {/* ... (Rest for navigation type etc) */}
                                        <label className="text-xs text-zinc-500">Navigation Type</label>
                                        <select
                                            value={editingCategory.type || 'page'}
                                            onChange={e => setEditingCategory({ ...editingCategory, type: e.target.value as any })}
                                            className="bg-zinc-800 border border-white/10 rounded px-2 py-1 text-white text-sm w-full"
                                        >
                                            <option value="page">Internal Page (/services/{cat.slug})</option>
                                            <option value="link">External Link (Redirect)</option>
                                        </select>

                                        {editingCategory.type === 'link' && (
                                            <input
                                                value={editingCategory.redirect_url || ''}
                                                onChange={e => setEditingCategory({ ...editingCategory, redirect_url: e.target.value })}
                                                placeholder="https://example.com"
                                                className="bg-zinc-800 border border-white/10 rounded px-2 py-1 text-white text-sm w-full"
                                            />
                                        )}

                                        <label className="text-xs text-zinc-500">Description</label>
                                        <textarea
                                            value={editingCategory.description || ''}
                                            onChange={e => setEditingCategory({ ...editingCategory, description: e.target.value })}
                                            className="bg-zinc-800 border border-white/10 rounded px-2 py-1 text-white text-sm w-full h-16 resize-none"
                                            placeholder="Short description..."
                                        />

                                        <div className="flex gap-2 mt-2">
                                            <button onClick={handleUpdateCategory} className="px-3 py-1 bg-green-500/20 text-green-400 rounded text-xs font-bold">Save Changes</button>
                                            <button onClick={() => setEditingCategory(null)} className="px-3 py-1 bg-white/5 text-zinc-400 rounded text-xs">Cancel</button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <div className="font-medium text-white">{cat.title}</div>
                                                    {(cat as any).is_visible === false && <span className="bg-red-500/20 text-red-500 text-[10px] px-1 rounded">HIDDEN</span>}
                                                </div>
                                                <div className="text-xs text-zinc-500 mt-1">
                                                    {cat.type === 'link' ? `Redirects to ${cat.redirect_url}` : `/services/${cat.slug}`}
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                <button onClick={() => setEditingCategory(cat)} className="p-2 hover:bg-white/10 rounded-lg text-primary transition-colors">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => handleDeleteCategory(cat.id)} className="p-2 hover:bg-white/10 rounded-lg text-red-500 transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {isEditing && (
                <div className="bg-zinc-900 border border-white/10 p-6 rounded-xl mb-6">
                    <h2 className="text-xl font-medium text-white mb-4">{formData.id ? 'Edit Service' : 'New Service'}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Service Form logic ... */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* ... Title and Category Inputs ... */}
                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">Title</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title || ''}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">Category</label>
                                <select
                                    value={formData.category_id || ''}
                                    onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                                    className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white"
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.title}</option>
                                    ))}
                                </select>
                            </div>
                            {/* ... */}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">Display Mode</label>
                                <select
                                    value={formData.display_mode || 'content'}
                                    onChange={e => setFormData({ ...formData, display_mode: e.target.value as any })}
                                    className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white"
                                >
                                    <option value="content">Content Page (Internal)</option>
                                    <option value="redirect">Redirect Link (External)</option>
                                </select>
                            </div>
                            {formData.display_mode === 'redirect' && (
                                <div>
                                    <label className="block text-sm text-zinc-400 mb-1">Redirect URL</label>
                                    <input
                                        type="url"
                                        value={formData.redirect_url || ''}
                                        onChange={e => setFormData({ ...formData, redirect_url: e.target.value })}
                                        placeholder="https://example.com/booking"
                                        className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white"
                                    />
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm text-zinc-400 mb-1">Description</label>
                            <textarea
                                required
                                value={formData.description || ''}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white h-24"
                            />
                        </div>

                        {/* Thumbnail URL Input */}
                        <div>
                            <label className="block text-sm text-zinc-400 mb-1">Thumbnail URL</label>
                            <input
                                type="text"
                                value={formData.thumbnail_url || ''}
                                onChange={e => setFormData({ ...formData, thumbnail_url: e.target.value })}
                                placeholder="https://..."
                                className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white"
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">Price (₹)</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.price || 0}
                                    onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                                    className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">Price (INR)</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={formData.price_inr || 0}
                                    onChange={e => setFormData({ ...formData, price_inr: Number(e.target.value) })}
                                    className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">Duration (mins)</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={formData.duration_minutes ?? ''}
                                    onChange={e => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 0 })}
                                    className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="svc-visible"
                                checked={formData.is_visible !== false}
                                onChange={e => setFormData({ ...formData, is_visible: e.target.checked })}
                                className="w-4 h-4 rounded border-zinc-700 bg-black text-primary"
                            />
                            <label htmlFor="svc-visible" className="text-zinc-400 cursor-pointer select-none">Show on Student Dashboard</label>
                        </div>

                        <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                            <input
                                type="checkbox"
                                id="svc-birth"
                                checked={formData.requires_birth_details || false}
                                onChange={e => setFormData({ ...formData, requires_birth_details: e.target.checked })}
                                className="w-4 h-4 rounded border-zinc-700 bg-black text-primary"
                            />
                            <label htmlFor="svc-birth" className="text-blue-400 cursor-pointer select-none text-sm font-medium">Require Birth Details (Date, Time, Place) at Checkout</label>
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-primary text-black rounded-lg hover:bg-primary/90 font-medium"
                            >
                                Save Service
                            </button>
                        </div>
                    </form>
                </div>
            )}


            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map(service => {
                    const category = categories.find(c => c.id === service.category_id);
                    return (
                        <div key={service.id} className="bg-zinc-900 border border-white/5 p-6 rounded-xl flex justify-between items-start group hover:border-white/10 transition-colors">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400">
                                        <Sparkles size={14} />
                                    </span>
                                    <h3 className="font-medium text-white">{service.title}</h3>
                                    {service.display_mode === 'redirect' && <ExternalLink size={14} className="text-zinc-500" />}
                                </div>
                                <p className="text-xs text-primary mb-2 opacity-80">{category?.title || 'Uncategorized'}</p>
                                <p className="text-sm text-zinc-400 line-clamp-2 mb-3">{service.description}</p>
                                <div className="flex gap-4 text-xs text-zinc-500">
                                    <span>USD: ${service.price}</span>
                                    <span>INR: ₹{service.price_inr || 0}</span>
                                    <span>{service.duration_minutes} mins</span>
                                </div>
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => { setFormData(service); setIsEditing(true); }} className="p-2 bg-white/5 hover:bg-white/10 rounded text-white"><Edit2 size={14} /></button>
                                <button onClick={() => handleDelete(service.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded text-red-400"><Trash2 size={14} /></button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AdminServices;
