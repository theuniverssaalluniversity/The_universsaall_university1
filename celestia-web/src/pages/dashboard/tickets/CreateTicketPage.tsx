import { useState } from 'react';
import { supabase } from '../../../utils/supabase';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Send } from 'lucide-react';

const CreateTicketPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        subject: '',
        message: '',
        priority: 'medium'
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
            .from('support_tickets')
            .insert({
                user_id: user.id,
                subject: formData.subject,
                message: formData.message,
                priority: formData.priority,
                status: 'open'
            });

        if (error) {
            alert('Error creating ticket: ' + error.message);
        } else {
            navigate('/student/support'); // Or /instructor/support depending on role
        }
        setLoading(false);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-3xl font-serif text-white flex items-center gap-3">
                <MessageSquare className="text-primary" /> New Support Ticket
            </h1>

            <form onSubmit={handleSubmit} className="bg-zinc-900 border border-white/5 rounded-xl p-6 space-y-4">
                <div>
                    <label className="block text-sm text-zinc-400 mb-1">Subject</label>
                    <input
                        type="text"
                        required
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="Brief summary of your issue"
                    />
                </div>

                <div>
                    <label className="block text-sm text-zinc-400 mb-1">Priority</label>
                    <select
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    >
                        <option value="low">Low - General Question</option>
                        <option value="medium">Medium - Issue with Course/Order</option>
                        <option value="high">High - Urgent (Payment/Access)</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm text-zinc-400 mb-1">Message</label>
                    <textarea
                        required
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white h-32 focus:outline-none focus:border-primary resize-none"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Describe your issue in detail..."
                    />
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2.5 bg-primary text-black rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                        <Send size={18} /> {loading ? 'Submitting...' : 'Submit Ticket'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateTicketPage;
