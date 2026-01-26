import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase'; // Fixed import path
import { User, Mail, Phone, Hash, Save, Shield } from 'lucide-react';

const ProfilePage = () => {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        phone_number: '',
        address_line1: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch generic profile data (from users table or profiles if separated)
            // Assuming 'users' table holds the metadata or public.users holds profile info.
            // Based on earlier queries, public.users has 'unique_id', 'full_name' etc.
            const { data } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();

            if (data) {
                setProfile(data);
                setFormData({
                    full_name: data.full_name || '',
                    phone_number: data.phone_number || '',
                    address_line1: data.address_line1 || ''
                });
            }
            setLoading(false);
        };
        fetchProfile();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        const { error } = await supabase
            .from('users')
            .update({
                full_name: formData.full_name,
                phone_number: formData.phone_number,
                address_line1: formData.address_line1
            })
            .eq('id', profile.id);

        if (error) {
            alert('Error updating profile');
        } else {
            alert('Profile updated successfully');
        }
        setSaving(false);
    };

    if (loading) return <div className="text-zinc-500">Loading Profile...</div>;

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <h1 className="text-3xl font-serif text-white">My Profile</h1>

            {/* Unique ID Card */}
            <div className="bg-gradient-to-r from-primary/10 to-transparent border border-primary/20 rounded-xl p-6 flex items-center gap-6">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                    <Hash size={32} />
                </div>
                <div>
                    <h3 className="text-sm font-medium text-primary uppercase tracking-wider">Student Unique ID</h3>
                    <p className="text-3xl font-mono text-white font-bold tracking-widest">{profile.unique_id || 'Generating...'}</p>
                    <p className="text-xs text-zinc-500 mt-1">This ID is permanent and cannot be changed.</p>
                </div>
            </div>

            <div className="bg-zinc-900 border border-white/5 rounded-xl p-8 space-y-6">
                <div>
                    <h3 className="text-lg font-medium text-white mb-1">Personal Details</h3>
                    <p className="text-sm text-zinc-500">Update your personal information.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400">Full Name</label>
                        <div className="relative">
                            <User size={18} className="absolute left-3 top-3.5 text-zinc-600" />
                            <input
                                type="text"
                                value={formData.full_name}
                                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-4 py-3 text-white focus:border-primary/50 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400">Phone Number</label>
                        <div className="relative">
                            <Phone size={18} className="absolute left-3 top-3.5 text-zinc-600" />
                            <input
                                type="tel"
                                value={formData.phone_number}
                                onChange={e => setFormData({ ...formData, phone_number: e.target.value })}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-4 py-3 text-white focus:border-primary/50 focus:outline-none"
                                placeholder="+1 234 567 890"
                            />
                        </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-zinc-400">Email Address (Read Only)</label>
                        <div className="relative">
                            <Mail size={18} className="absolute left-3 top-3.5 text-zinc-600" />
                            <input
                                type="email"
                                value={profile.email}
                                disabled
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-3 text-zinc-500 cursor-not-allowed"
                            />
                            <Shield size={16} className="absolute right-4 top-4 text-zinc-700" />
                        </div>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-zinc-400">Address</label>
                        <input
                            type="text"
                            value={formData.address_line1}
                            onChange={e => setFormData({ ...formData, address_line1: e.target.value })}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-primary/50 focus:outline-none"
                            placeholder="Street address, City, Country"
                        />
                    </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-8 py-2.5 bg-primary text-black rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
                    >
                        {saving ? 'Saving...' : <><Save size={18} /> Save Changes</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
