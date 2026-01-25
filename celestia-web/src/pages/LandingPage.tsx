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

            {/* Latest Courses Teaser */}
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

                    <FeaturedCoursesGrid />

                    <div className="mt-8 text-center md:hidden">
                        <Link to="/courses" className="text-primary hover:text-accent font-medium">View All Courses</Link>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {courses.map((course) => (
                <Link key={course.id} to={`/courses/${course.id}`} className="group cursor-pointer">
                    <div className="aspect-[4/3] bg-zinc-800 rounded-xl overflow-hidden mb-6 relative">
                        {course.thumbnail_url ? (
                            <img
                                src={course.thumbnail_url}
                                alt={course.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        ) : (
                            <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-600">
                                No Image
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                    </div>
                    <h3 className="text-xl font-medium text-white group-hover:text-primary transition-colors mb-2">
                        {course.title}
                    </h3>
                    <p className="text-zinc-500 text-sm line-clamp-2">{course.description}</p>
                    <div className="mt-3 flex items-center gap-2 text-sm text-primary">
                        <span>{course.price > 0 ? `$${course.price}` : 'Free'}</span>
                        <span className="w-1 h-1 bg-zinc-600 rounded-full" />
                        <span>View Details</span>
                    </div>
                </Link>
            ))}
        </div>
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
            price_inr: product.price_inr,
            type: 'product',
            quantity: 1
        });
        alert('Added to cart!');
    };

    if (loading) return <div className="text-zinc-500">Loading shop items...</div>;

    if (products.length === 0) return null; // Don't show if empty

    return (
        <section className="py-24 relative overflow-hidden bg-zinc-900/20 md:border-t md:border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-4xl md:text-5xl font-serif text-white mb-4">Cosmic Shop</h2>
                        <p className="text-zinc-400">Tools for your spiritual journey.</p>
                    </div>
                    <Link to="/shop" className="hidden md:flex items-center text-primary hover:text-accent transition-colors gap-2">
                        View All Products <ArrowRight size={16} />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {products.map((product) => (
                        <Link key={product.id} to={product.slug ? `/shop/${product.slug}` : `/shop`} className="group block bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden hover:border-primary/30 transition-all">
                            <div className="aspect-square bg-zinc-800 relative overflow-hidden">
                                {product.image_url ? (
                                    <img src={product.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={product.title} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-zinc-700">No Image</div>
                                )}
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-medium text-white mb-2">{product.title}</h3>
                                <div className="flex justify-between items-center mt-4">
                                    <span className="text-primary font-bold text-lg">
                                        {formatPrice(product.price, product.price_inr)}
                                    </span>
                                    <button
                                        onClick={(e) => handleAddToCart(e, product)}
                                        className="p-3 bg-white text-black rounded-full hover:bg-primary transition-colors z-10"
                                    >
                                        <ShoppingBag size={18} />
                                    </button>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default LandingPage;
