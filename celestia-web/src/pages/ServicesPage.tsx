import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { Clock, Calendar, ArrowRight, Sparkles, Heart, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCurrency } from '../context/CurrencyContext';
import { useCart } from '../context/CartContext';

interface Service {
    id: string;
    title: string;
    description: string;
    duration_minutes: number;
    price: number;
    price_inr?: number;
    display_mode?: 'content' | 'redirect';
    redirect_url?: string;
}

interface Category {
    id: string;
    title: string;
    description: string;
    slug: string;
    icon_name?: string;
}

interface ServicesPageProps {
    categorySlug?: string;
}

const ServicesPage = ({ categorySlug: propSlug }: ServicesPageProps) => {
    const { categorySlug: paramSlug } = useParams();
    const slug = propSlug || paramSlug || 'reading';

    const { formatPrice } = useCurrency();
    const { addItem } = useCart();
    const [services, setServices] = useState<Service[]>([]);
    const [category, setCategory] = useState<Category | null>(null);
    const [loading, setLoading] = useState(true);
    const location = useLocation(); // Added
    const isDashboard = location.pathname.startsWith('/student') || location.pathname.startsWith('/instructor');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            // 1. Fetch Category Info
            const { data: catData } = await supabase
                .from('service_categories')
                .select('*')
                .eq('slug', slug)
                .single();

            if (catData) {
                setCategory(catData);

                // 2. Fetch Services
                const { data: svcData } = await supabase
                    .from('services')
                    .select('*')
                    .eq('category_id', catData.id)
                    .order('price', { ascending: true });

                if (svcData) setServices(svcData);
            } else {
                // Fallback for legacy "type" based behavior if category not found (optional)
                // or just show empty
            }
            setLoading(false);
        };
        fetchData();
    }, [slug]);

    const handleBook = (service: Service) => {
        if (service.display_mode === 'redirect' && service.redirect_url) {
            window.location.href = service.redirect_url;
        } else {
            addItem({
                itemId: service.id,
                title: service.title,
                price: service.price,
                price_inr: service.price_inr,
                type: 'service',
                quantity: 1,
            });
            // Cart opens automatically in addItem
        }
    };

    if (loading) return <div className="min-h-screen pt-40 text-center text-zinc-500">Loading services...</div>;

    if (!category) return (
        <div className="min-h-screen pt-40 text-center text-zinc-500">
            <h1 className="text-2xl text-white mb-2">Category Not Found</h1>
            <p>The requested service category "{slug}" does not exist.</p>
        </div>
    );

    return (
        <div className={isDashboard ? "space-y-8" : "min-h-screen pt-20 pb-12"}>
            {/* Header */}
            <div className={isDashboard ? "bg-zinc-800/50 border border-white/5 rounded-2xl p-8 mb-8" : "relative py-24 bg-zinc-900/30 overflow-hidden mb-12"}>
                {!isDashboard && <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />}
                <div className={isDashboard ? "" : "max-w-7xl mx-auto px-4 relative z-10 text-center"}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className={isDashboard ? "w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4" : "w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6"}>
                            {slug === 'healing' ? <Heart size={isDashboard ? 24 : 32} /> : <Sparkles size={isDashboard ? 24 : 32} />}
                        </div>
                        <h1 className={isDashboard ? "text-2xl font-serif text-white mb-2" : "text-4xl md:text-6xl font-serif text-white mb-6"}>{category.title}</h1>
                        <p className={isDashboard ? "text-zinc-400" : "text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed"}>
                            {category.description || `Explore our ${category.title} services designed to guide and heal.`}
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {services.length === 0 ? (
                    <div className="text-center py-20 border border-dashed border-zinc-800 rounded-2xl">
                        <p className="text-zinc-500 text-lg">No services available in this category yet.</p>
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
                                        {service.display_mode === 'redirect' ? <ExternalLink size={16} /> : <Calendar size={16} />}
                                        <span>{service.display_mode === 'redirect' ? 'External' : 'Book Now'}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                    <span className="text-2xl font-medium text-white">
                                        {formatPrice(service.price, service.price_inr)}
                                    </span>
                                    <button
                                        onClick={() => handleBook(service)}
                                        className="px-6 py-2.5 bg-white text-black rounded-lg font-medium hover:bg-primary hover:text-black transition-colors flex items-center gap-2"
                                    >
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
