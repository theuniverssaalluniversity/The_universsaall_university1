import { useConfig } from '../context/ConfigContext';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Moon, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
    const config = useConfig();

    const features = [
        {
            icon: Moon,
            title: "Ancient Wisdom",
            description: "Rooted in centuries of astrological tradition and varied modalities."
        },
        {
            icon: Star,
            title: "Master Guides",
            description: "Learn from and consult with vastly experienced practitioners."
        },
        {
            icon: Sparkles,
            title: "Personal Growth",
            description: "Transform your life through structured courses and personal readings."
        }
    ];

    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
                {/* Background Elements */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900/50 via-background to-background" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] opacity-30 animate-pulse" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-6xl md:text-8xl font-serif font-medium tracking-tight mb-6">
                            <span className="block text-white">Unlock Your</span>
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary bg-300% animate-gradient">
                                Cosmic Potential
                            </span>
                        </h1>
                        <p className="mt-6 text-xl md:text-2xl text-zinc-400 max-w-3xl mx-auto leading-relaxed">
                            Welcome to <span className="text-white font-medium">{config.name}</span>.
                            The premier destination for astrological education, spiritual healing, and self-discovery.
                        </p>

                        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/courses" className="px-8 py-4 bg-primary text-black rounded-full font-medium text-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2 group">
                                Explore Courses
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link to="/readings" className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-full font-medium text-lg hover:bg-white/10 transition-all">
                                Book a Reading
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-zinc-900/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {features.map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.2 }}
                                className="text-center p-8 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/30 transition-colors"
                            >
                                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
                                    <feature.icon size={32} />
                                </div>
                                <h3 className="text-2xl font-serif text-white mb-4">{feature.title}</h3>
                                <p className="text-zinc-400 leading-relaxed">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Latest Courses Teaser (Static Placeholder for now) */}
            <section className="py-24 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="text-4xl md:text-5xl font-serif text-white mb-4">Featured Wisdom</h2>
                            <p className="text-zinc-400">Begin your journey with our most popular courses.</p>
                        </div>
                        <Link to="/courses" className="hidden md:flex items-center text-primary hover:text-accent transition-colors gap-2">
                            View All Courses <ArrowRight size={16} />
                        </Link>
                    </div>

                    {/* Placeholder Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[1, 2, 3].map((_, i) => (
                            <div key={i} className="group cursor-pointer">
                                <div className="aspect-[4/3] bg-zinc-800 rounded-xl overflow-hidden mb-6 relative">
                                    <div className="absolute inset-0 bg-zinc-800 animate-pulse" />
                                    {/* In real implementation, this would be an image */}
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                                </div>
                                <h3 className="text-xl font-medium text-white group-hover:text-primary transition-colors mb-2">
                                    Introduction to Vedic Astrology
                                </h3>
                                <p className="text-zinc-500 text-sm">By Master Guide • 12 Lessons</p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 text-center md:hidden">
                        <Link to="/courses" className="text-primary hover:text-accent font-medium">View All Courses</Link>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default LandingPage;
