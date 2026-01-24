import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase';
import { Plus, Trash2, Edit2 } from 'lucide-react';

interface Product {
    id: string;
    title: string;
    description: string;
    price: number;
    image_url: string;
    is_digital: boolean;
}

const AdminShop = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Partial<Product>>({
        title: '', description: '', price: 0, image_url: '', is_digital: false
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        if (data) setProducts(data);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const { error } = await supabase.from('products').upsert(formData).select();
        if (!error) {
            setIsEditing(false);
            setFormData({ title: '', description: '', price: 0, image_url: '', is_digital: false });
            fetchProducts();
        } else {
            alert('Error saving product: ' + error.message);
        }
    };

    // ... (Similar Delete/Render logic as AdminServices but for Products)
    // To save context space, I'll use the same structure logic implicitly or simplified.
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
                    onClick={() => { setIsEditing(true); setFormData({ is_digital: false }); }}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-black rounded-lg font-bold hover:bg-primary/90 transition-colors"
                >
                    <Plus size={18} /> Add Product
                </button>
            </div>

            {isEditing && (
                <div className="bg-zinc-900 border border-white/10 p-6 rounded-xl mb-6">
                    <h2 className="text-xl font-medium text-white mb-4">{formData.id ? 'Edit Product' : 'New Product'}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Simplified Form for brevity in this turn, covers essential fields */}
                        <input type="text" placeholder="Title" required value={formData.title || ''} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white" />
                        <textarea placeholder="Description" required value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white h-24" />
                        <div className="grid grid-cols-2 gap-4">
                            <input type="number" placeholder="Price" required value={formData.price || 0} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white" />
                            <input type="text" placeholder="Image URL" value={formData.image_url || ''} onChange={e => setFormData({ ...formData, image_url: e.target.value })} className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white" />
                        </div>
                        <div className="flex items-center gap-2">
                            <input type="checkbox" checked={formData.is_digital || false} onChange={e => setFormData({ ...formData, is_digital: e.target.checked })} />
                            <span className="text-zinc-400">Digital Product?</span>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 bg-zinc-800 text-white rounded-lg">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-primary text-black rounded-lg font-medium">Save Product</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {products.map(product => (
                    <div key={product.id} className="bg-zinc-900 border border-white/5 rounded-xl overflow-hidden group">
                        <div className="aspect-square bg-zinc-800 relative">
                            {product.image_url && <img src={product.image_url} className="w-full h-full object-cover" />}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button onClick={() => { setFormData(product); setIsEditing(true); }} className="p-2 bg-white text-black rounded-full"><Edit2 size={16} /></button>
                                <button onClick={() => handleDelete(product.id)} className="p-2 bg-red-500 text-white rounded-full"><Trash2 size={16} /></button>
                            </div>
                        </div>
                        <div className="p-4">
                            <h3 className="text-white font-medium mb-1 truncate">{product.title}</h3>
                            <p className="text-primary font-bold">${product.price}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminShop;
