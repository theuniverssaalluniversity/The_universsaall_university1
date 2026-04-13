import { useConfig } from '../context/ConfigContext';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Moon, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

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

    const heroVariants: any = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2, delayChildren: 0.1 }
        }
    };

    const textReveal: any = {
        hidden: { opacity: 0, filter: "blur(15px)", y: 30, scale: 0.95 },
        visible: { opacity: 1, filter: "blur(0px)", y: 0, scale: 1, transition: { duration: 0.8, ease: "easeOut" } }
    };

    return (
        <div className="flex flex-col bg-background selection:bg-primary/30">
            <Helmet>
                <title>The Universsaall University | Astrology Courses & Consultations</title>
                <meta name="description" content="The premier destination for astrological education, spiritual healing, and self-discovery." />
            </Helmet>
            {/* Hero Section */}
            <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden">
                {/* Background Elements */}
                <div className="absolute inset-0 z-0 bg-black overflow-hidden">
                    
                    {/* Slow Ambient Om Pattern Background */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, filter: "blur(40px)" }}
                            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                            transition={{ duration: 6, ease: "easeOut" }}
                            className="relative flex items-center justify-center w-full h-full"
                        >
                            {/* Main visible OM */}
                            <motion.span 
                                initial={{ opacity: 0, clipPath: "inset(100% 0% 0% 0%)" }}
                                animate={{ opacity: 0.3, clipPath: "inset(0% 0% 0% 0%)" }}
                                transition={{ duration: 5, ease: "easeOut", delay: 0.5 }}
                                className="absolute text-[18rem] md:text-[28rem] text-[#39ff14] font-serif blur-[8px] select-none"
                            >
                                ॐ
                            </motion.span>
                            {/* Glow behind the OM */}
                            <motion.span 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.2 }}
                                transition={{ duration: 8, ease: "easeInOut" }}
                                className="absolute text-[18rem] md:text-[28rem] text-[#39ff14] font-serif blur-[50px] select-none"
                            >
                                ॐ
                            </motion.span>
                        </motion.div>
                    </div>

                    {/* Vignette mask to darken edges */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_black_80%)]" />

                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 0.3, scale: 1 }}
                        transition={{ duration: 6, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" 
                    />
                </div>

                {/* Shifted Container Up with -translate-y-16 */}
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center -translate-y-16">
                    <motion.div
                        variants={heroVariants}
                        initial="hidden"
                        animate="visible"
                        className="flex flex-col items-center"
                    >
                        <motion.div variants={textReveal} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 backdrop-blur-md mb-8 shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)]">
                            <Sparkles className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium text-primary tracking-wide uppercase">Discover Your Path</span>
                        </motion.div>

                        <motion.h1 variants={textReveal} className="text-6xl md:text-8xl lg:text-[7rem] font-serif font-medium tracking-tight mb-8 leading-tight drop-shadow-2xl">
                            <span className="block text-white mb-2">Unlock Your</span>
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-[#39ff14] to-primary bg-[length:200%_auto] animate-gradient pb-2 inline-block">
                                Cosmic Potential
                            </span>
                        </motion.h1>

                        <motion.p variants={textReveal} className="text-xl md:text-2xl text-zinc-300 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
                            Welcome to <span className="text-white font-semibold">{config.name}</span>.<br />
                            The premier destination for astrological education, spiritual healing, and self-discovery.
                        </motion.p>

                        <motion.div variants={textReveal} className="mt-14 flex flex-col sm:flex-row gap-6 justify-center w-full sm:w-auto">
                            <Link to="/courses">
                                <motion.button 
                                    whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(var(--primary-rgb), 0.5)" }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-10 py-5 w-full sm:w-auto bg-gradient-to-r from-primary to-accent text-black rounded-full font-bold text-lg transition-all flex items-center justify-center gap-3 group border border-primary/10"
                                >
                                    Explore Courses
                                    <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" />
                                </motion.button>
                            </Link>
                            <Link to="/services/reading">
                                <motion.button 
                                    whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.15)", borderColor: "rgba(255,255,255,0.4)" }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-10 py-5 w-full sm:w-auto bg-white/5 border border-white/20 text-white rounded-full font-medium text-lg transition-all backdrop-blur-md shadow-lg"
                                >
                                    Book a Reading
                                </motion.button>
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>

                {/* Scroll Indicator at true bottom */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.5, duration: 1 }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 opacity-60"
                >
                    <span className="text-xs uppercase tracking-[0.3em] font-medium text-[#39ff14]/70">Scroll down</span>
                    <motion.div 
                        animate={{ y: [0, 15, 0] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        className="w-[2px] h-16 bg-gradient-to-b from-[#39ff14]/50 via-primary/30 to-transparent rounded-full" 
                    />
                </motion.div>
            </section>

            {/* Features Section */}
            <section className="py-32 relative bg-zinc-950">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div 
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={{
                            hidden: { opacity: 0 },
                            visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
                        }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12"
                    >
                        {features.map((feature, idx) => (
                            <motion.div
                                key={idx}
                                variants={{
                                    hidden: { opacity: 0, y: 30 },
                                    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
                                }}
                                whileHover={{ y: -10 }}
                                className="group relative text-center p-10 rounded-3xl bg-zinc-900 border border-white/5 overflow-hidden transition-colors hover:border-primary/50"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <motion.div 
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    className="w-20 h-20 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-8 text-primary shadow-[0_0_30px_rgba(var(--primary-rgb),0.2)] group-hover:shadow-[0_0_50px_rgba(var(--primary-rgb),0.4)] transition-shadow duration-500"
                                >
                                    <feature.icon size={40} className="group-hover:text-white transition-colors" />
                                </motion.div>
                                <h3 className="text-2xl font-serif text-white mb-4 relative z-10">{feature.title}</h3>
                                <p className="text-zinc-400 leading-relaxed relative z-10">{feature.description}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Latest Courses Teaser */}
            <section className="py-32 relative bg-black overflow-hidden">
                <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] opacity-50 pointer-events-none" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="flex flex-col md:flex-row md:justify-between md:items-end mb-16 gap-6"
                    >
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-px bg-primary" />
                                <span className="text-primary text-sm font-medium uppercase tracking-widest">Education</span>
                            </div>
                            <h2 className="text-4xl md:text-6xl font-serif text-white">Featured Wisdom</h2>
                            <p className="text-zinc-400 mt-4 text-lg">Begin your journey with our most transformative courses.</p>
                        </div>
                        <Link to="/courses" className="hidden md:flex items-center group">
                            <motion.button 
                                whileHover={{ x: 5 }}
                                className="text-white hover:text-primary transition-colors flex items-center gap-2 font-medium text-lg"
                            >
                                View All Courses <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                            </motion.button>
                        </Link>
                    </motion.div>

                    <FeaturedCoursesGrid />

                    <div className="mt-12 text-center md:hidden">
                        <Link to="/courses">
                            <button className="w-full py-4 border border-white/20 rounded-xl text-white font-medium flex justify-center items-center gap-2 active:bg-white/5">
                                View All Courses <ArrowRight size={18} />
                            </button>
                        </Link>
                    </div>
                </div>
            </section>

            <FeaturedProductsGrid />
        </div>
    );
};

// Sub-component for data fetching
import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';

const FeaturedCoursesGrid = () => {
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeatured = async () => {
            // First try to get explicitly featured courses
            let { data } = await supabase
                .from('courses')
                .select('*')
                .eq('status', 'published')
                .eq('is_deleted', false)
                .eq('is_featured', true)
                .limit(3);

            // Fallback: If no featured courses, get latest published
            if (!data || data.length === 0) {
                const { data: latest } = await supabase
                    .from('courses')
                    .select('*')
                    .eq('status', 'published')
                    .eq('is_deleted', false)
                    .order('created_at', { ascending: false })
                    .limit(3);
                data = latest || [];
            }

            setCourses(data || []);
            setLoading(false);
        };
        fetchFeatured();
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[1, 2, 3].map(i => (
                    <div key={i} className="aspect-[4/3] bg-zinc-800/50 animate-pulse rounded-xl" />
                ))}
            </div>
        );
    }

    if (courses.length === 0) {
        return (
            <div className="text-center py-12 border border-dashed border-zinc-800 rounded-xl">
                <p className="text-zinc-500">No courses available yet.</p>
            </div>
        );
    }

    return (
        <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
            }}
            className="grid grid-cols-1 md:grid-cols-3 gap-10"
        >
            {courses.map((course) => (
                <motion.div 
                    key={course.id} 
                    variants={{
                        hidden: { opacity: 0, y: 30 },
                        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80 } }
                    }}
                >
                    <Link to={`/courses/${course.id}`} className="block group cursor-pointer h-full">
                        <div className="bg-zinc-900 border border-white/5 rounded-3xl overflow-hidden h-full hover:border-primary/40 transition-colors duration-500">
                            <div className="aspect-[4/3] bg-zinc-800 relative overflow-hidden">
                                {course.thumbnail_url ? (
                                    <motion.img
                                        whileHover={{ scale: 1.08 }}
                                        transition={{ duration: 0.6, ease: "easeOut" }}
                                        src={course.thumbnail_url}
                                        alt={course.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-600">
                                        No Image
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                                <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                    <div className="bg-primary text-black px-4 py-2 rounded-full text-sm font-bold w-fit mx-auto shadow-lg">
                                        View Syllabus
                                    </div>
                                </div>
                            </div>
                            <div className="p-8">
                                <div className="text-primary text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Star size={12} fill="currentColor" /> {course.price > 0 ? `₹${course.price}` : 'Free'}
                                </div>
                                <h3 className="text-2xl font-serif text-white group-hover:text-primary transition-colors mb-3">
                                    {course.title}
                                </h3>
                                <p className="text-zinc-400 text-sm line-clamp-2 leading-relaxed">{course.description}</p>
                            </div>
                        </div>
                    </Link>
                </motion.div>
            ))}
        </motion.div>
    );
};

// NEW: Featured Products Component (Shop)
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { ShoppingBag } from 'lucide-react';

const FeaturedProductsGrid = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { addItem } = useCart();
    const { formatPrice } = useCurrency();

    useEffect(() => {
        const fetchProducts = async () => {
            const { data } = await supabase
                .from('products')
                .select('*')
                .limit(3)
                .order('created_at', { ascending: false });

            if (data) setProducts(data);
            setLoading(false);
        };
        fetchProducts();
    }, []);

    const handleAddToCart = (e: any, product: any) => {
        e.preventDefault(); // Prevent navigation if wrapped in Link
        addItem({
            itemId: product.id,
            title: product.title,
            price: product.price,
            type: 'product',
            quantity: 1
        });
        alert('Added to cart!');
    };

    if (loading) return <div className="text-zinc-500">Loading shop items...</div>;

    if (products.length === 0) return null; // Don't show if empty

    return (
        <section className="py-32 relative overflow-hidden bg-zinc-950 md:border-t md:border-white/5">
            <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[150px] pointer-events-none" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="flex justify-between items-end mb-16"
                    style={{ alignItems: "flex-end", display: "flex" }}
                >
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-px bg-accent" />
                            <span className="text-accent text-sm font-medium uppercase tracking-widest">Altar & Tools</span>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-serif text-white">Cosmic Shop</h2>
                        <p className="text-zinc-400 mt-4 text-lg">Sacred tools to support your spiritual journey.</p>
                    </div>
                    <Link to="/shop" className="hidden md:flex items-center group">
                        <motion.button 
                            whileHover={{ x: 5 }}
                            className="text-white hover:text-accent transition-colors flex items-center gap-2 font-medium text-lg"
                        >
                            View All Products <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                        </motion.button>
                    </Link>
                </motion.div>

                <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    variants={{
                        hidden: { opacity: 0 },
                        visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
                    }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-10"
                >
                    {products.map((product) => (
                        <motion.div
                            key={product.id}
                            variants={{
                                hidden: { opacity: 0, y: 40 },
                                visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80 } }
                            }}
                        >
                            <Link to={product.slug ? `/shop/${product.slug}` : `/shop`} className="group block h-full bg-black border border-white/10 rounded-3xl overflow-hidden hover:border-accent/40 shadow-2xl transition-colors duration-500 relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0" />
                                <div className="aspect-[4/5] bg-zinc-900 relative overflow-hidden z-10 m-3 rounded-2xl">
                                    {product.image_url ? (
                                        <motion.img 
                                            whileHover={{ scale: 1.1 }}
                                            transition={{ duration: 0.7, ease: "easeOut" }}
                                            src={product.image_url} 
                                            className="w-full h-full object-cover" 
                                            alt={product.title} 
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-zinc-700">No Image</div>
                                    )}
                                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
                                </div>
                                <div className="p-6 relative z-10 flex flex-col justify-between" style={{ minHeight: "150px" }}>
                                    <h3 className="text-2xl font-serif text-white mb-2 group-hover:text-accent transition-colors">{product.title}</h3>
                                    <div className="flex justify-between items-center mt-auto pt-4">
                                        <span className="text-xl text-zinc-300 font-medium font-sans">
                                            {formatPrice(product.price)}
                                        </span>
                                        <motion.button
                                            whileHover={{ scale: 1.1, backgroundColor: "var(--accent)", color: "#000" }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={(e) => handleAddToCart(e, product)}
                                            className="p-4 bg-zinc-800 text-white rounded-full transition-colors shadow-lg border border-white/10 group-hover:border-accent/30"
                                        >
                                            <ShoppingBag size={20} />
                                        </motion.button>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>

                <div className="mt-12 text-center md:hidden">
                    <Link to="/shop">
                        <button className="w-full py-4 border border-white/20 rounded-xl text-white font-medium flex justify-center items-center gap-2 active:bg-white/5">
                            Shop All Products <ArrowRight size={18} />
                        </button>
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default LandingPage;
