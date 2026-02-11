import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { ArrowLeft, Clock, Sparkles, ShieldCheck, User } from 'lucide-react';
import { motion } from 'framer-motion';

const ServiceDetailPage = () => {
    const { serviceId } = useParams();
    const navigate = useNavigate();
    const [service, setService] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { addItem } = useCart();
    const { formatPrice } = useCurrency();
    // const [added, setAdded] = useState(false); // Unused for now as we redirect

    useEffect(() => {
        const fetchService = async () => {
            if (!serviceId) return;
            const { data, error } = await supabase
                .from('services')
                .select('*, service_categories(title, slug)')
                .eq('id', serviceId)
                .single();

            if (error) console.error(error); // Use error
            if (data) setService(data);
            setLoading(false);
        };
        fetchService();
    }, [serviceId]);

    const handleBookNow = () => {
        if (!service) return;
        addItem({
            itemId: service.id,
            title: service.title,
            price: service.price,
            price_inr: service.price_inr,
            type: 'service',
            quantity: 1,
            // Pass the birth details requirement to the cart item
            // Note: You might need to update your CartItem type in CartContext to accept custom props or extended data
            metadata: {
                requires_birth_details: service.requires_birth_details
            }
        });
        // setAdded(true);
        // Navigate directly to checkout for services usually
        navigate('/checkout');
    };

    if (loading) return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
    );

    if (!service) return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center p-8">
            <h1 className="text-3xl font-serif text-white mb-4">Service Not Found</h1>
            <Link to="/" className="text-primary hover:underline flex items-center gap-2">
                <ArrowLeft size={16} /> Back Home
            </Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-background text-white pt-24 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Link */}
                <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors group">
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    Back (Services)
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
                    {/* Left: Image */}
                    <div className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="aspect-square bg-zinc-900 rounded-2xl overflow-hidden border border-white/5 relative group"
                        >
                            {service.thumbnail_url ? (
                                <img
                                    src={service.thumbnail_url}
                                    alt={service.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-600 flex-col gap-2">
                                    <Sparkles size={48} className="opacity-20" />
                                    <span>Divine Service</span>
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* Right: Details */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-8"
                    >
                        <div>
                            <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full mb-4 uppercase tracking-wider">
                                {service.service_categories?.title || 'Service'}
                            </span>
                            <h1 className="text-4xl md:text-5xl font-serif text-white mb-4 leading-tight">{service.title}</h1>
                            <div className="flex items-end gap-4">
                                <div className="text-2xl font-bold text-primary">
                                    {formatPrice(service.price, service.price_inr)}
                                </div>
                                <div className="text-zinc-500 text-sm mb-1 flex items-center gap-1">
                                    <Clock size={16} /> {service.duration_minutes} mins
                                </div>
                            </div>
                        </div>

                        {/* Short Description */}
                        <p className="text-lg text-zinc-400 leading-relaxed border-l-2 border-primary/30 pl-4">
                            {service.description}
                        </p>

                        {/* Birth Details Warning */}
                        {service.requires_birth_details && (
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-3 text-blue-300 items-start">
                                <User className="shrink-0 mt-1" size={18} />
                                <div className="text-sm">
                                    <p className="font-bold mb-1">Birth Details Required</p>
                                    <p className="opacity-80">You will be asked to provide your Name, Date of Birth, Time, and Place during checkout for this service.</p>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="pt-4 border-t border-white/5">
                            <button
                                onClick={handleBookNow}
                                className="w-full py-4 px-8 rounded-full font-bold text-lg flex items-center justify-center gap-3 transition-all bg-primary text-black hover:bg-primary/90 hover:scale-[1.02] shadow-lg shadow-primary/20"
                            >
                                Book Now
                            </button>
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-2 gap-4 py-6">
                            <div className="flex items-center gap-3 text-sm text-zinc-400">
                                <div className="p-2 bg-zinc-800 rounded-full text-zinc-200"><ShieldCheck size={18} /></div>
                                <span>Confidential & Secure</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-zinc-400">
                                <div className="p-2 bg-zinc-800 rounded-full text-zinc-200"><Sparkles size={18} /></div>
                                <span>Expert Guidance</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default ServiceDetailPage;
