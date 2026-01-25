import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { useConfig } from '../context/ConfigContext';
import { supabase } from '../utils/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const CheckoutPage = () => {
    const { items, total, clearCart } = useCart();
    const { formatPrice } = useCurrency();
    const config = useConfig();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handlePlaceOrder = async () => {
        setLoading(true);
        setError(null);

        try {
            // 1. Check Auth (Ideally wrapped in ProtectedRoute, but double check)
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                // If guest checkout is main flow, we might capture email here.
                // For now, assume login required or capture basic meta if public.
                // Let's redirect to login for simplicity as per requirements (dashboard visibility)
                navigate('/login?redirect=/checkout');
                return;
            }

            // 2. Create Order
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert({
                    user_id: user.id,
                    total_amount: total,
                    status: 'pending',
                    // provider: 'manual' (or stripe later)
                })
                .select()
                .single();

            if (orderError) throw orderError;

            // 3. Create Order Items
            const orderItems = items.map(item => ({
                order_id: order.id,
                item_id: item.itemId, // Note: Schema calls it item_id, ensure type match
                item_type: item.type, // 'service' | 'course' | 'product'
                price: item.price
            }));

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItems);

            if (itemsError) throw itemsError;

            // 4. Success
            clearCart();
            // Optional: Create notification record here if needed immediately
            await supabase.from('notifications').insert({
                type: 'admin_new_order',
                payload: { order_id: order.id, total: total, user_email: user.email },
                status: 'pending'
            });

            navigate('/student/orders'); // Redirect to orders page

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to place order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="min-h-screen pt-40 px-4 text-center">
                <div className="max-w-md mx-auto bg-zinc-900 border border-white/10 rounded-2xl p-8">
                    <ShoppingBag className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Your cart is empty</h2>
                    <p className="text-zinc-400 mb-6">Looks like you haven't added anything yet.</p>
                    <Link to="/services/reading" className="inline-flex items-center gap-2 text-primary hover:text-primary-400 font-medium">
                        Browse Services <ArrowRight size={16} />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-32 pb-20 px-4">
            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">

                {/* Order Summary */}
                <div>
                    <h1 className="text-3xl font-serif text-white mb-8">Checkout</h1>

                    <div className="space-y-6">
                        {items.map((item) => (
                            <div key={item.id} className="flex gap-4 bg-zinc-900/50 p-4 rounded-xl border border-white/5">
                                <div className="w-20 h-20 bg-zinc-800 rounded-lg flex-shrink-0 overflow-hidden">
                                    {item.image ? (
                                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs">No Img</div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-white font-medium">{item.title}</h3>
                                    <p className="text-sm text-zinc-400 capitalize">{item.type}</p>
                                    <div className="mt-2 flex justify-between items-center">
                                        <span className="text-zinc-500 text-sm">Qty: {item.quantity}</span>
                                        <span className="text-primary font-bold">
                                            {formatPrice(item.price * item.quantity)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Payment / Confirm */}
                <div className="lg:pl-12">
                    <div className="bg-zinc-900 border border-white/10 rounded-2xl p-8 sticky top-32">
                        <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>

                        <div className="space-y-4 mb-6 text-zinc-400">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span className="text-white">{formatPrice(total)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Taxes</span>
                                <span className="text-white">Included</span>
                            </div>
                        </div>

                        <div className="border-t border-white/10 pt-4 mb-8 flex justify-between items-center">
                            <span className="text-lg font-bold text-white">Total</span>
                            <span className="text-2xl font-bold text-primary">{formatPrice(total)}</span>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg mb-6 text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handlePlaceOrder}
                            disabled={loading}
                            className="w-full py-4 bg-primary text-black font-bold rounded-xl hover:bg-primary-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    Complete Order <ArrowRight size={20} />
                                </>
                            )}
                        </button>

                        <p className="text-center text-xs text-zinc-500 mt-4">
                            By placing this order, you agree to our Terms of Service.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
