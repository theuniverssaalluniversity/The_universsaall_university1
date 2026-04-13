import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { useConfig } from '../../context/ConfigContext';
import { Save, RefreshCw } from 'lucide-react';

const AdminSettings = () => {
    const config = useConfig();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: config.name,
        logo_url: config.logo_url || '',
        primary_color: '#BFA15F' // Default gold
    });

    // Load initial values from config context
    useEffect(() => {
        setFormData({
            name: config.name,
            logo_url: config.logo_url || '',
            primary_color: '#BFA15F'
        });
    }, [config]);

    const handleSave = async () => {
        setLoading(true);
        // Update the FIRST organization record found (Single Tenant mode)
        // In multi-tenant, we would use an ID.

        // 1. Get Org ID
        const { data: orgs } = await supabase.from('organizations').select('id').limit(1).single();

        if (orgs) {
            const { error } = await supabase
                .from('organizations')
                .update({
                    name: formData.name,
                    logo_url: formData.logo_url,
                    // theme_colors logic would go here if we expanded the schema to support detailed color mapping
                })
                .eq('id', orgs.id);

            if (error) {
                alert('Failed to update settings');
                console.error(error);
            } else {
                alert('Settings updated! Refresh the page to see changes.');
                window.location.reload();
            }
        }
        setLoading(false);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <h1 className="text-3xl font-serif text-white">Platform Settings</h1>

            <div className="bg-zinc-900 border border-white/5 rounded-xl p-8 space-y-6">
                <div>
                    <h3 className="text-lg font-medium text-white mb-1">Branding</h3>
                    <p className="text-sm text-zinc-500">Manage the look and feel of your white-label platform.</p>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400">Platform Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary/50"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400">Logo URL</label>
                        <div className="flex gap-4">
                            <input
                                type="url"
                                value={formData.logo_url}
                                onChange={(e) => setFormData(prev => ({ ...prev, logo_url: e.target.value }))}
                                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary/50"
                                placeholder="https://..."
                            />
                            <div className="w-12 h-12 bg-zinc-800 rounded-lg border border-zinc-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                                {formData.logo_url ? <img src={formData.logo_url} className="w-full h-full object-cover" /> : <span className="text-xs text-zinc-600">Logo</span>}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-6 py-2 bg-primary text-black rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
                    >
                        {loading ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                        Save Changes
                    </button>
                </div>
            </div>

            <div className="bg-zinc-900 border border-white/5 rounded-xl p-8">
                <h3 className="text-lg font-medium text-white mb-4">Database Connection</h3>
                <div className="text-sm text-zinc-500">
                    <p>Connected to Supabase Project: <span className="text-primary">celestia-core</span></p>
                    <p>Status: <span className="text-green-500">Operational</span></p>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
