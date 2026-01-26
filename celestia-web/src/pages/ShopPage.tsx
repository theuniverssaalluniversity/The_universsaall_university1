import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext'; // Added
import { Link, useLocation } from 'react-router-dom';

interface Product {
    id: string;
    title: string;
    description: string;
    price: number;
    price_inr?: number; // Added
    image_url: string;
    is_digital: boolean;
    slug?: string; // Added
}

const ShopPage = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const { addItem } = useCart();
    const { formatPrice } = useCurrency(); // Added
    const location = useLocation();
    const isDashboard = location.pathname.startsWith('/student') || location.pathname.startsWith('/instructor');

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            const { data } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (data) setProducts(data);
            setLoading(false);
        };
        fetchProducts();
    }, []);

    const handleAddToCart = (e: React.MouseEvent, product: Product) => {
        e.preventDefault();
        addItem({
            itemId: product.id,
            title: product.title,
            price: product.price,
            price_inr: product.price_inr, // Added
            type: 'product',
            quantity: 1,
            image: product.image_url
        });
        alert('Added to cart!');
    };

    return (
        <div className={isDashboard ? "space-y-8" : "min-h-screen pt-20 pb-12"}>
            {/* Header */}
            <div className={isDashboard ? "bg-zinc-800/50 border border-white/5 rounded-2xl p-8 mb-8" : "relative py-24 bg-zinc-900/30 overflow-hidden mb-12"}>
                {!isDashboard && <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent" />}
                <div className={isDashboard ? "" : "max-w-7xl mx-auto px-4 relative z-10 text-center"}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className={isDashboard ? "text-2xl font-serif text-white mb-2" : "text-4xl md:text-6xl font-serif text-white mb-6"}>Cosmic Shop</h1>
                        <p className={isDashboard ? "text-zinc-400" : "text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed"}>
                            Curated tools and artifacts to support your spiritual journey.
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-80 bg-zinc-800/50 animate-pulse rounded-2xl" />
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20 border border-dashed border-zinc-800 rounded-2xl">
                        <ShoppingBag size={48} className="mx-auto text-zinc-700 mb-4" />
                        <p className="text-zinc-500 text-lg">The shop is currently being stocked.</p>
                        <p className="text-zinc-600 mt-2">Come back soon!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {products.map((product, idx) => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="group bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden hover:border-primary/30 transition-all flex flex-col"
                            >
                                {/* Link wrapper using slug if available */}
                                <Link to={`/shop/${product.slug || product.id}`} className="block">
                                    <div className="aspect-square bg-zinc-800 relative overflow-hidden">
                                        {product.image_url ? (
                                            <img src={product.image_url} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-zinc-600">
                                                <ShoppingBag size={32} />
                                            </div>
                                        )}
                                        {product.is_digital && (
                                            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-xs text-white font-medium">
                                                Digital
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-6 pb-0 flex flex-col flex-1">
                                        <h3 className="text-lg font-medium text-white mb-2 line-clamp-1">{product.title}</h3>
                                        <p className="text-zinc-400 text-sm mb-4 line-clamp-2">{product.description}</p>
                                    </div>
                                </Link>

                                <div className="px-6 pb-6 mt-auto flex items-center justify-between">
                                    <span className="text-xl font-bold text-white">
                                        {formatPrice(product.price, product.price_inr)}
                                    </span>
                                    <button
                                        onClick={(e) => handleAddToCart(e, product)}
                                        className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-primary hover:text-black transition-colors"
                                    >
                                        <ShoppingBag size={18} />
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

export default ShopPage;
