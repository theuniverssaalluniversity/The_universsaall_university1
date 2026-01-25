import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase';
import { Plus, Trash2, Edit2, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';

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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-serif text-white">Shop Management</h1>
                <button
                    onClick={() => { setIsEditing(true); setFormData({ is_digital: false, price_inr: 0 }); }}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-black rounded-lg font-bold hover:bg-primary/90 transition-colors"
                >
                    <Plus size={18} /> Add Product
                </button>
            </div>

            {isEditing && (
                <div className="bg-zinc-900 border border-white/10 p-6 rounded-xl mb-6 animate-fade-in">
                    <h2 className="text-xl font-medium text-white mb-4">{formData.id ? 'Edit Product' : 'New Product'}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">Title</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title || ''}
                                    onChange={handleTitleChange}
                                    className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:border-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">Slug (URL)</label>
                                <div className="relative">
                                    <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                                    <input
                                        type="text"
                                        required
                                        value={formData.slug || ''}
                                        onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                        className="w-full bg-black border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:border-primary outline-none"
                                        placeholder="product-url-slug"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-zinc-400 mb-1">Short Description</label>
                            <textarea
                                required
                                value={formData.description || ''}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white h-20 resize-none focus:border-primary outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-zinc-400 mb-1">Product Page Content (HTML/Rich Text)</label>
                            <textarea
                                value={formData.content || ''}
                                onChange={e => setFormData({ ...formData, content: e.target.value })}
                                className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white h-40 font-mono text-sm focus:border-primary outline-none"
                                placeholder="<p>Detailed product info here...</p>"
                            />
                            <p className="text-xs text-zinc-500 mt-1">Accepts basic HTML for formatting.</p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">Price (USD)</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    value={formData.price || 0}
                                    onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                                    className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:border-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">Price (INR)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.price_inr || 0}
                                    onChange={e => setFormData({ ...formData, price_inr: Number(e.target.value) })}
                                    className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:border-primary outline-none"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm text-zinc-400 mb-1">Image URL</label>
                                <div className="relative">
                                    <ImageIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                                    <input
                                        type="text"
                                        value={formData.image_url || ''}
                                        onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                                        className="w-full bg-black border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:border-primary outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="is_digital"
                                checked={formData.is_digital || false}
                                onChange={e => setFormData({ ...formData, is_digital: e.target.checked })}
                                className="w-4 h-4 rounded border-zinc-700 bg-black text-primary"
                            />
                            <label htmlFor="is_digital" className="text-zinc-400 cursor-pointer select-none">Digital Product (No Shipping Required)</label>
                        </div>

                        <div className="flex justify-end gap-2 pt-4 border-t border-white/5">
                            <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors">Cancel</button>
                            <button type="submit" className="px-6 py-2 bg-primary text-black rounded-lg font-medium hover:bg-primary/90 transition-colors">Save Product</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {products.map(product => (
                    <div key={product.id} className="bg-zinc-900 border border-white/5 rounded-xl overflow-hidden group hover:border-white/20 transition-all">
                        <div className="aspect-square bg-zinc-800 relative">
                            {product.image_url ? (
                                <img src={product.image_url} className="w-full h-full object-cover" alt={product.title} />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-600">No Image</div>
                            )}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                                <button onClick={() => { setFormData(product); setIsEditing(true); }} className="p-2 bg-white text-black rounded-full hover:scale-110 transition-transform"><Edit2 size={16} /></button>
                                <button onClick={() => handleDelete(product.id)} className="p-2 bg-red-500 text-white rounded-full hover:scale-110 transition-transform"><Trash2 size={16} /></button>
                            </div>
                        </div>
                        <div className="p-4">
                            <h3 className="text-white font-medium mb-1 truncate" title={product.title}>{product.title}</h3>
                            <div className="flex justify-between items-center mt-2">
                                <div className="flex flex-col">
                                    <span className="text-primary font-bold text-lg">${product.price}</span>
                                    {product.price_inr && <span className="text-zinc-500 text-xs">₹{product.price_inr}</span>}
                                </div>
                                <span className={`text-[10px] px-2 py-1 rounded-full ${product.is_digital ? 'bg-blue-500/10 text-blue-400' : 'bg-orange-500/10 text-orange-400'}`}>
                                    {product.is_digital ? 'Digital' : 'Physical'}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminShop;
