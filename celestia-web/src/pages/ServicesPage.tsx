import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { Clock, Calendar, ArrowRight, Sparkles, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

interface Service {
    id: string;
    title: string;
    description: string;
    duration_minutes: number;
    price: number;
    type: 'reading' | 'healing';
}

interface ServicesPageProps {
    type: 'reading' | 'healing';
}

const ServicesPage = ({ type }: ServicesPageProps) => {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchServices = async () => {
            setLoading(true);
            const { data } = await supabase
                .from('services')
                .select('*')
                .eq('type', type)
                .order('price', { ascending: true });

            if (data) setServices(data);
            setLoading(false);
        };
        fetchServices();
    }, [type]);

    const title = type === 'reading' ? 'Cosmic Readings' : 'Spiritual Healings';
    const subtitle = type === 'reading'
        ? 'Gain clarity and insight into your life path with our expert astrological readings.'
        : 'Restore balance and harmony to your energy field with our transformative healing sessions.';
    const Icon = type === 'reading' ? Sparkles : Heart;

    return (
        <div className="min-h-screen pt-20 pb-12">
            {/* Header */}
            <div className="relative py-24 bg-zinc-900/30 overflow-hidden mb-12">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
                <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
                            <Icon size={32} />
                        </div>
                        <h1 className="text-4xl md:text-6xl font-serif text-white mb-6">{title}</h1>
                        <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                            {subtitle}
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-64 bg-zinc-800/50 animate-pulse rounded-2xl" />
                        ))}
                    </div>
                ) : services.length === 0 ? (
                    <div className="text-center py-20 border border-dashed border-zinc-800 rounded-2xl">
                        <p className="text-zinc-500 text-lg">No {type} services available at the moment.</p>
                        <p className="text-zinc-600 mt-2">Please check back later.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {services.map((service, idx) => (
                            <motion.div
                                key={service.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-zinc-900 border border-white/5 rounded-2xl p-8 hover:border-primary/30 transition-all group flex flex-col"
                            >
                                <h3 className="text-2xl font-serif text-white mb-3 group-hover:text-primary transition-colors">
                                    {service.title}
                                </h3>
                                <p className="text-zinc-400 mb-8 flex-1 leading-relaxed">
                                    {service.description}
                                </p>

                                <div className="flex items-center gap-6 text-sm text-zinc-500 mb-8">
                                    <div className="flex items-center gap-2">
                                        <Clock size={16} />
                                        <span>{service.duration_minutes} mins</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar size={16} />
                                        <span>Book Now</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                    <span className="text-2xl font-medium text-white">
                                        ${service.price}
                                    </span>
                                    <button className="px-6 py-2.5 bg-white text-black rounded-lg font-medium hover:bg-primary hover:text-black transition-colors flex items-center gap-2">
                                        Book <ArrowRight size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ServicesPage;
