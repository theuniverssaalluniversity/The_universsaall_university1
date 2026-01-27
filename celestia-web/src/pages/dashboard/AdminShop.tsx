import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase';
import { Plus, Trash2, Edit2, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { RichTextEditor } from '../../components/ui/RichTextEditor';

interface Product {
    id: string;
    title: string;
    slug: string;
    description: string;
    content?: string; // Rich description
    price: number;
    price_inr?: number;
    image_url: string;
    is_digital: boolean;
}

const AdminShop = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Partial<Product>>({
        title: '', slug: '', description: '', content: '', price: 0, price_inr: 0, image_url: '', is_digital: false
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        if (data) setProducts(data);
    };

    const generateSlug = (title: string) => {
        return title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        setFormData(prev => ({
            ...prev,
            title,
            slug: prev.slug ? prev.slug : generateSlug(title) // Auto-generate slug if dry
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.slug) {
            alert('Slug is required');
            return;
        }

        const { error } = await supabase.from('products').upsert(formData).select();
        if (!error) {
            setIsEditing(false);
            setFormData({ title: '', slug: '', description: '', content: '', price: 0, price_inr: 0, image_url: '', is_digital: false });
            fetchProducts();
        } else {
            console.error(error);
            alert('Error saving product: ' + error.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (!error) fetchProducts();
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Link copied to clipboard!');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-serif text-white">Shop Management</h1>
                <button
                    onClick={() => {
                        setIsEditing(true);
                        setFormData({
                            title: '',
                            slug: '',
                            description: '',
                            content: '',
                            price: 0,
                            price_inr: 0,
                            image_url: '',
                            is_digital: false
                        });
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-black rounded-lg font-bold hover:bg-primary/90 transition-colors"
                >
                    <Plus size={18} /> Add Product
                </button>
            </div>

            {isEditing && (
                <div className="bg-zinc-900 border border-white/10 p-6 rounded-xl mb-6 animate-fade-in shadow-2xl">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-serif text-white">{formData.id ? 'Edit Product' : 'New Product'}</h2>
                        <button onClick={() => setIsEditing(false)} className="text-zinc-500 hover:text-white"><Trash2 size={20} className="rotate-45" /></button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-zinc-400">Title</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title || ''}
                                    onChange={handleTitleChange}
                                    className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary outline-none"
                                    placeholder="e.g. Advanced Astrological Reading"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-zinc-400">Slug (URL Path)</label>
                                <div className="relative">
                                    <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                                    <input
                                        type="text"
                                        required
                                        value={formData.slug || ''}
                                        onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                        className="w-full bg-black border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:border-primary outline-none"
                                        placeholder="advanced-reading"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-zinc-400">Short Description (Card Summary)</label>
                            <textarea
                                required
                                value={formData.description || ''}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white h-24 resize-none focus:border-primary outline-none"
                                placeholder="A brief overview appearing on the shop card..."
                            />
                        </div>

                        {/* Rich Content + Preview Split */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Rich Text Editor */}
                            <div className="col-span-1 lg:col-span-2 space-y-2">
                                <label className="block text-sm font-medium text-zinc-400">Product Details (Rich Text)</label>
                                <RichTextEditor
                                    value={formData.content || ''}
                                    onChange={(html) => setFormData({ ...formData, content: html })}
                                    placeholder="Describe your product... Use the toolbar for formatting."
                                    className="h-80"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-zinc-400">Live Preview</label>
                                <div className="w-full h-64 bg-zinc-800/50 border border-white/5 rounded-lg p-4 overflow-y-auto prose prose-invert max-w-none">
                                    {formData.content ? (
                                        <div dangerouslySetInnerHTML={{ __html: formData.content }} />
                                    ) : (
                                        <p className="text-zinc-600 italic">Content preview will appear here...</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Pricing & Media */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-zinc-400">Price (USD)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={formData.price || 0}
                                        onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                                        className="w-full bg-black border border-white/10 rounded-lg pl-8 pr-4 py-3 text-white focus:border-primary outline-none"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-zinc-400">Price (INR)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">₹</span>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.price_inr || 0}
                                        onChange={e => setFormData({ ...formData, price_inr: Number(e.target.value) })}
                                        className="w-full bg-black border border-white/10 rounded-lg pl-8 pr-4 py-3 text-white focus:border-primary outline-none"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-zinc-400">Product Image URL</label>
                                <div className="relative">
                                    <ImageIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                                    <input
                                        type="text"
                                        value={formData.image_url || ''}
                                        onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                                        className="w-full bg-black border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:border-primary outline-none"
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Settings */}
                        <div className="flex items-center gap-3 p-4 bg-black/30 rounded-lg border border-white/5">
                            <input
                                type="checkbox"
                                id="is_digital"
                                checked={formData.is_digital || false}
                                onChange={e => setFormData({ ...formData, is_digital: e.target.checked })}
                                className="w-5 h-5 rounded border-zinc-700 bg-black text-primary accent-primary"
                            />
                            <div>
                                <label htmlFor="is_digital" className="text-white font-medium cursor-pointer select-none">Digital Product</label>
                                <p className="text-xs text-zinc-500">Checking this disables shipping address requirement at checkout.</p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
                            <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-3 bg-zinc-800 text-white rounded-xl hover:bg-zinc-700 transition-colors font-medium">Cancel</button>
                            <button type="submit" className="px-8 py-3 bg-primary text-black rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">Save Product</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map(product => (
                    <div key={product.id} className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden group hover:border-primary/30 transition-all hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1">
                        {/* Image Area */}
                        <div className="aspect-square bg-zinc-800 relative overflow-hidden">
                            {product.image_url ? (
                                <img src={product.image_url} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt={product.title} />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-600 bg-zinc-800">
                                    <ImageIcon size={32} opacity={0.5} />
                                </div>
                            )}
                            {/* Overlay Actions */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-3 backdrop-blur-[2px]">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => { setFormData(product); setIsEditing(true); }}
                                        className="p-3 bg-white text-black rounded-full hover:scale-110 transition-transform shadow-lg"
                                        title="Edit"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(product.id)}
                                        className="p-3 bg-red-500 text-white rounded-full hover:scale-110 transition-transform shadow-lg"
                                        title="Delete"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                <div className="flex gap-2 mt-2">
                                    <button
                                        onClick={() => window.open(`/shop/${product.slug}`, '_blank')}
                                        className="px-4 py-2 bg-zinc-800 text-white text-xs font-bold rounded-full border border-white/20 hover:bg-white hover:text-black transition-colors"
                                    >
                                        View Live
                                    </button>
                                    <button
                                        onClick={() => copyToClipboard(`${window.location.origin}/shop/${product.slug}`)}
                                        className="px-4 py-2 bg-zinc-800 text-white text-xs font-bold rounded-full border border-white/20 hover:bg-white hover:text-black transition-colors"
                                    >
                                        Copy Link
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-5">
                            <div className="flex justify-between items-start gap-2 mb-2">
                                <h3 className="text-white font-serif font-medium text-lg leading-tight line-clamp-2" title={product.title}>{product.title}</h3>
                                <span className={`flex-shrink-0 text-[10px] px-2 py-1 rounded-full border ${product.is_digital ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
                                    {product.is_digital ? 'Digital' : 'Physical'}
                                </span>
                            </div>

                            <p className="text-zinc-500 text-sm line-clamp-2 mb-4 h-10">{product.description}</p>

                            <div className="flex justify-between items-end border-t border-white/5 pt-4">
                                <div>
                                    <p className="text-xs text-zinc-600 mb-0.5 uppercase tracking-wider font-bold">Price</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-primary font-bold text-xl">${product.price}</span>
                                        {product.price_inr && <span className="text-zinc-500 text-sm">₹{product.price_inr}</span>}
                                    </div>
                                </div>
                                <div className="text-right">
                                    {/* Placeholder for future sales stats if needed */}
                                    {/* <span className="text-xs text-zinc-500">0 Sold</span> */}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminShop;
