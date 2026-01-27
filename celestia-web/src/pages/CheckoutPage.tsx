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
    const [addressMode, setAddressMode] = useState<'saved' | 'new'>('new');
    const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
    const [selectedAddressIndex, setSelectedAddressIndex] = useState<number>(-1);
    const [newAddress, setNewAddress] = useState({
        line1: '',
        city: '',
        state: '',
        zip: '',
        country: 'India'
    });

    useEffect(() => {
        // Fetch previous addresses from order history
        const fetchAddresses = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: orders } = await supabase
                .from('orders')
                .select('shipping_address')
                .eq('user_id', user.id)
                .not('shipping_address', 'is', null)
                .order('created_at', { ascending: false })
                .limit(10);

            if (orders) {
                // Deduplicate addresses based on content
                const unique = new Map();
                orders.forEach(o => {
                    const addr = o.shipping_address;
                    const key = JSON.stringify(addr);
                    if (!unique.has(key)) unique.set(key, addr);
                });
                const list = Array.from(unique.values());
                setSavedAddresses(list);
                if (list.length > 0) {
                    setAddressMode('saved');
                    setSelectedAddressIndex(0);
                }
            }
        };
        fetchAddresses();
    }, []);

    const handlePlaceOrder = async () => {
        setLoading(true);
        setError(null);

        try {
            // Validation
            let finalAddress = null;
            if (addressMode === 'new') {
                if (!newAddress.line1 || !newAddress.city || !newAddress.zip) {
                    throw new Error("Please fill in all required address fields.");
                }
                finalAddress = newAddress;
            } else {
                if (selectedAddressIndex === -1 || !savedAddresses[selectedAddressIndex]) {
                    throw new Error("Please select a saved address or create a new one.");
                }
                finalAddress = savedAddresses[selectedAddressIndex];
            }

            // 1. Check Auth
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
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
                    shipping_address: finalAddress
                })
                .select()
                .single();

            if (orderError) throw orderError;

            // 3. Create Order Items
            const orderItems = items.map(item => ({
                order_id: order.id,
                item_id: item.itemId,
                item_type: item.type,
                price: item.price
            }));

            const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
            if (itemsError) throw itemsError;

            // 4. Send Confirmation Email (Simulated)
            const { sendEmail, emailTemplates } = await import('../utils/emailService');
            await sendEmail({
                to: user.email || '',
                ...emailTemplates.orderConfirmation(order.id, formatPrice(total))
            });

            // 5. Success
            clearCart();
            navigate('/student/orders');

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to place order.');
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

                        <h2 className="text-xl font-bold text-white mb-6">Shipping Details</h2>

                        {/* Saved Addresses Tabs */}
                        {savedAddresses.length > 0 && (
                            <div className="flex gap-2 mb-4">
                                <button
                                    onClick={() => setAddressMode('saved')}
                                    className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors ${addressMode === 'saved' ? 'bg-primary text-black border-primary' : 'bg-transparent border-white/10 text-zinc-400 hover:text-white'}`}
                                >
                                    Saved Addresses
                                </button>
                                <button
                                    onClick={() => setAddressMode('new')}
                                    className={`flex-1 py-2 text-sm font-medium rounded-lg border transition-colors ${addressMode === 'new' ? 'bg-primary text-black border-primary' : 'bg-transparent border-white/10 text-zinc-400 hover:text-white'}`}
                                >
                                    New Address
                                </button>
                            </div>
                        )}

                        {addressMode === 'saved' && savedAddresses.length > 0 ? (
                            <div className="space-y-3 mb-6">
                                {savedAddresses.map((addr, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => setSelectedAddressIndex(idx)}
                                        className={`p-3 rounded-xl border cursor-pointer flex items-start gap-3 transition-colors ${selectedAddressIndex === idx ? 'bg-primary/10 border-primary' : 'bg-zinc-800/50 border-white/5 hover:border-white/20'}`}
                                    >
                                        <div className={`w-4 h-4 rounded-full border mt-1 flex items-center justify-center ${selectedAddressIndex === idx ? 'border-primary' : 'border-zinc-500'}`}>
                                            {selectedAddressIndex === idx && <div className="w-2 h-2 rounded-full bg-primary" />}
                                        </div>
                                        <div className="text-sm">
                                            <div className="text-white">{addr.line1}</div>
                                            <div className="text-zinc-500">{addr.city}, {addr.state} {addr.zip}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="text-xs text-zinc-400 mb-1 block">Address Line 1</label>
                                    <input
                                        type="text"
                                        value={newAddress.line1}
                                        onChange={e => setNewAddress({ ...newAddress, line1: e.target.value })}
                                        className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-primary/50 outline-none"
                                        placeholder="Street Address"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-zinc-400 mb-1 block">City</label>
                                        <input
                                            type="text"
                                            value={newAddress.city}
                                            onChange={e => setNewAddress({ ...newAddress, city: e.target.value })}
                                            className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-primary/50 outline-none"
                                            placeholder="City"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-zinc-400 mb-1 block">Zip Code</label>
                                        <input
                                            type="text"
                                            value={newAddress.zip}
                                            onChange={e => setNewAddress({ ...newAddress, zip: e.target.value })}
                                            className="w-full bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-primary/50 outline-none"
                                            placeholder="ZIP"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-zinc-400 mb-1 block">State & Country</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newAddress.state}
                                            onChange={e => setNewAddress({ ...newAddress, state: e.target.value })}
                                            className="flex-1 bg-zinc-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-primary/50 outline-none"
                                            placeholder="State"
                                        />
                                        <input
                                            type="text"
                                            value={newAddress.country}
                                            disabled
                                            className="w-20 bg-zinc-900 border border-white/5 rounded-lg px-3 py-2 text-zinc-500 text-sm cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

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
