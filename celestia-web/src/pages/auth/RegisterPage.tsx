import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabase';
import { useConfig } from '../../context/ConfigContext';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';

const RegisterPage = () => {
    const config = useConfig();
    const navigate = useNavigate();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 1. Sign up with Supabase Auth
            const { data, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`
                    }
                }
            });

            if (authError) throw authError;

            if (data.user) {
                // Redirect to Login with success message or auto-login
                // For now, let's redirect to login
                navigate('/login');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to sign up');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
            {/* Left Panel - Visual */}
            <div className="hidden md:flex flex-col justify-center p-12 bg-zinc-900 border-r border-white/5 relative overflow-hidden order-2">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-accent/10 via-zinc-900 to-zinc-950" />
                <div className="relative z-10">
                    <h2 className="text-4xl font-serif text-white mb-6">Join the Community</h2>
                    <p className="text-xl text-zinc-400 leading-relaxed max-w-md">
                        Begin your exploration of the cosmos. Unlock exclusive courses, readings, and a community of seekers.
                    </p>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="flex items-center justify-center p-8 bg-background order-1">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl font-serif text-white mb-2">Create Account</h1>
                        <p className="text-zinc-500">Sign up to get started with {config.name}.</p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-500 text-sm"
                        >
                            <AlertCircle size={16} />
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleRegister} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-400">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                                <input
                                    type="text"
                                    required
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-400">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-400">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg pl-10 pr-12 py-3 text-white focus:outline-none focus:border-primary/50 transition-colors"
                                    placeholder="At least 6 characters"
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-black font-medium py-3 rounded-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating Account...' : 'Sign Up'}
                            {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>

                    <div className="text-center text-sm text-zinc-500">
                        Already have an account? {' '}
                        <Link to="/login" className="text-primary hover:text-accent font-medium">Sign in</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
