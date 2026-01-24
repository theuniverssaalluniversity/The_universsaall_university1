import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase';
import { Plus, Trash2, Edit2, Sparkles, Heart } from 'lucide-react';

interface Service {
    id: string;
    title: string;
    description: string;
    price: number;
    duration_minutes: number;
    type: 'reading' | 'healing';
}

const AdminServices = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Partial<Service>>({
        title: '', description: '', price: 0, duration_minutes: 60, type: 'reading'
    });

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        setLoading(true);
        const { data } = await supabase.from('services').select('*').order('created_at', { ascending: false });
        if (data) setServices(data);
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const { error } = await supabase.from('services').upsert(formData).select();
        if (!error) {
            setIsEditing(false);
            setFormData({ title: '', description: '', price: 0, duration_minutes: 60, type: 'reading' });
            fetchServices();
        } else {
            alert('Error saving service: ' + error.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        const { error } = await supabase.from('services').delete().eq('id', id);
        if (!error) fetchServices();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-serif text-white">Services Management</h1>
                <button
                    onClick={() => { setIsEditing(true); setFormData({ type: 'reading' }); }}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-black rounded-lg font-bold hover:bg-primary/90 transition-colors"
                >
                    <Plus size={18} /> Add Service
                </button>
            </div>

            {isEditing && (
                <div className="bg-zinc-900 border border-white/10 p-6 rounded-xl mb-6">
                    <h2 className="text-xl font-medium text-white mb-4">{formData.id ? 'Edit Service' : 'New Service'}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
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
                                <label className="block text-sm text-zinc-400 mb-1">Type</label>
                                <select
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                                    className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white"
                                >
                                    <option value="reading">Reading</option>
                                    <option value="healing">Healing</option>
                                </select>
                            </div>
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
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">Price ($)</label>
                                <input
                                    type="number"
                                    required
                                    value={formData.price || 0}
                                    onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                                    className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">Duration (mins)</label>
                                <input
                                    type="number"
                                    required
                                    value={formData.duration_minutes || 60}
                                    onChange={e => setFormData({ ...formData, duration_minutes: Number(e.target.value) })}
                                    className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white"
                                />
                            </div>
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
                {services.map(service => (
                    <div key={service.id} className="bg-zinc-900 border border-white/5 p-6 rounded-xl flex justify-between items-start group hover:border-white/10 transition-colors">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`p-1.5 rounded-lg ${service.type === 'reading' ? 'bg-purple-500/10 text-purple-400' : 'bg-pink-500/10 text-pink-400'}`}>
                                    {service.type === 'reading' ? <Sparkles size={14} /> : <Heart size={14} />}
                                </span>
                                <h3 className="font-medium text-white">{service.title}</h3>
                            </div>
                            <p className="text-sm text-zinc-400 line-clamp-2 mb-3">{service.description}</p>
                            <div className="flex gap-4 text-xs text-zinc-500">
                                <span>${service.price}</span>
                                <span>{service.duration_minutes} mins</span>
                            </div>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setFormData(service); setIsEditing(true); }} className="p-2 bg-white/5 hover:bg-white/10 rounded text-white"><Edit2 size={14} /></button>
                            <button onClick={() => handleDelete(service.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded text-red-400"><Trash2 size={14} /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminServices;
