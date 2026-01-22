import { useState } from 'react';
import { supabase } from '../../utils/supabase';
import { Shield } from 'lucide-react';

const TestUserSeeder = () => {
    const [logs, setLogs] = useState<string[]>([]);
    const [status, setStatus] = useState<string>('');

    const log = (msg: string) => setLogs(prev => [...prev, msg]);

    const seedUsers = async () => {
        setStatus('Seeding...');
        setLogs([]);

        try {
            const users = [
                { email: 'student@example.com', pass: 'password123', name: 'Test Student' },
                { email: 'instructor@example.com', pass: 'password123', name: 'Test Instructor' },
                { email: 'admin@example.com', pass: 'password123', name: 'Test Admin' },
            ];

            for (const u of users) {
                log(`Creating ${u.email}...`);
                const { data, error } = await supabase.auth.signUp({
                    email: u.email,
                    password: u.pass,
                    options: { data: { full_name: u.name } }
                });

                if (error) {
                    log(`❌ Error ${u.email}: ${error.message}`);
                    console.error(error);
                } else if (data.user) {
                    // Check if ident exists (user might exist but return success)
                    log(`✅ Created/Found ${u.email} (ID: ${data.user.id.slice(0, 5)}...)`);
                } else {
                    log(`⚠️ No User Data for ${u.email}`);
                }
            }
            setStatus('Done. Check logs below.');
        } catch (e: any) {
            setStatus('Error. See logs.');
            log(`CRITICAL: ${e.message}`);
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <button
                onClick={seedUsers}
                className="bg-red-500/20 text-red-500 border border-red-500/50 px-4 py-2 rounded-lg text-xs font-mono hover:bg-red-500/30 transition-colors flex items-center gap-2"
            >
                <Shield size={12} /> Seed Test Users
            </button>
            {status && (
                <div className="absolute bottom-full right-0 bg-black/90 border border-zinc-700 text-white text-xs p-3 rounded mb-2 w-64 max-h-48 overflow-y-auto">
                    <div className="font-bold mb-2 border-b border-zinc-700 pb-1">{status}</div>
                    {logs.map((l, i) => (
                        <div key={i} className="mb-1 font-mono text-zinc-400">{l}</div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TestUserSeeder;
