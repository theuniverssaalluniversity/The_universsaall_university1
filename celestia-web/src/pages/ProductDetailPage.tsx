import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { ArrowLeft, ShoppingBag, Check, Package, ShieldCheck, Truck } from 'lucide-react';
import { motion } from 'framer-motion';

const ProductDetailPage = () => {
    const { slug } = useParams();
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { addItem } = useCart();
    const { formatPrice } = useCurrency();
    const [added, setAdded] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            if (!slug) return;
            // Fetch by slug
            const { data } = await supabase
                .from('products')
                .select('*')
                .eq('slug', slug)
                .single();

            if (data) setProduct(data);
            setLoading(false);
        };
        fetchProduct();
    }, [slug]);

    const handleAddToCart = () => {
        if (!product) return;
        addItem({
            itemId: product.id,
            title: product.title,
            price: product.price,
            price_inr: product.price_inr,
            type: 'product',
            quantity: 1
        });
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    if (loading) return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
    );

    if (!product) return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center p-8">
            <h1 className="text-3xl font-serif text-white mb-4">Product Not Found</h1>
            <Link to="/shop" className="text-primary hover:underline flex items-center gap-2">
                <ArrowLeft size={16} /> Back to Shop
            </Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-background text-white pt-24 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Link */}
                <Link to="/shop" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors group">
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Shop
                </Link>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
                    {/* Left: Image */}
                    <div className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="aspect-square bg-zinc-900 rounded-2xl overflow-hidden border border-white/5 relative group"
                        >
                            {product.image_url ? (
                                <img
                                    src={product.image_url}
                                    alt={product.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-600 flex-col gap-2">
                                    <Package size={48} className="opacity-20" />
                                    <span>No Image available</span>
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
                                {product.is_digital ? 'Digital Product' : 'Physical Product'}
                            </span>
                            <h1 className="text-4xl md:text-5xl font-serif text-white mb-4 leading-tight">{product.title}</h1>
                            <div className="text-2xl font-bold text-primary">
                                {formatPrice(product.price, product.price_inr)}
                            </div>
                        </div>

                        {/* Short Description */}
                        <p className="text-lg text-zinc-400 leading-relaxed border-l-2 border-primary/30 pl-4">
                            {product.description}
                        </p>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-white/5">
                            <button
                                onClick={handleAddToCart}
                                disabled={added}
                                className={`flex-1 py-4 px-8 rounded-full font-bold text-lg flex items-center justify-center gap-3 transition-all ${added
                                    ? 'bg-green-500 text-black hover:bg-green-400'
                                    : 'bg-primary text-black hover:bg-primary/90 hover:scale-[1.02]'
                                    }`}
                            >
                                {added ? (
                                    <>
                                        <Check size={20} /> Added to Cart
                                    </>
                                ) : (
                                    <>
                                        <ShoppingBag size={20} /> Add to Cart
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-2 gap-4 py-6">
                            <div className="flex items-center gap-3 text-sm text-zinc-400">
                                <div className="p-2 bg-zinc-800 rounded-full text-zinc-200"><ShieldCheck size={18} /></div>
                                <span>Secure Checkout</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-zinc-400">
                                <div className="p-2 bg-zinc-800 rounded-full text-zinc-200"><Truck size={18} /></div>
                                <span>{product.is_digital ? 'Instant Delivery' : 'Fast Shipping'}</span>
                            </div>
                        </div>

                        {/* Rich Content (HTML) */}
                        {product.content && (
                            <div className="mt-8 pt-8 border-t border-white/5">
                                <h3 className="text-xl font-serif text-white mb-4">Product Details</h3>
                                <div
                                    className="prose prose-invert prose-p:text-zinc-400 prose-headings:text-white prose-strong:text-white max-w-none"
                                    dangerouslySetInnerHTML={{ __html: product.content }}
                                />
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;
