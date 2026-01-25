import React from 'react';
import { X, Trash2, ShoppingBag } from 'lucide-react';
import { useCart, type CartItem } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext'; // Assuming this context exists based on App.tsx
import { useNavigate } from 'react-router-dom';

const CartDrawer: React.FC = () => {
    const { items, removeItem, total, isOpen, toggleCart } = useCart();
    const { formatPrice } = useCurrency(); // Assuming formatPrice exists
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleCheckout = () => {
        // Navigate to checkout page or handle checkout logic directly
        // For now, we'll navigate to a checkout page (to be created)
        toggleCart();
        navigate('/checkout');
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={toggleCart}
            />

            {/* Drawer */}
            <div className="relative w-full max-w-md bg-zinc-900 h-full shadow-2xl border-l border-white/10 flex flex-col transform transition-transform duration-300">

                {/* Header */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between bg-zinc-900/50 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <ShoppingBag className="w-6 h-6 text-primary-400" />
                        <h2 className="text-xl font-bold text-white">Your Cart</h2>
                        <span className="bg-primary-500/10 text-primary-400 px-2 py-0.5 rounded-full text-sm font-medium">
                            {items.length}
                        </span>
                    </div>
                    <button
                        onClick={toggleCart}
                        className="p-2 hover:bg-white/5 rounded-full text-zinc-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                            <ShoppingBag className="w-16 h-16 text-zinc-600" />
                            <p className="text-zinc-400 text-lg">Your cart is empty</p>
                            <button
                                onClick={toggleCart}
                                className="text-primary-400 hover:text-primary-300 font-medium"
                            >
                                Browse Services
                            </button>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div
                                key={item.id}
                                className="group relative bg-zinc-800/50 rounded-xl p-4 border border-white/5 hover:border-primary-500/20 transition-all flex gap-4"
                            >
                                {/* Item Image */}
                                <div className="w-20 h-20 rounded-lg bg-zinc-700 overflow-hidden flex-shrink-0">
                                    {item.image ? (
                                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-zinc-500 text-xs">
                                            No Image
                                        </div>
                                    )}
                                </div>

                                {/* Item Details */}
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-white font-medium line-clamp-1">{item.title}</h3>
                                        <p className="text-xs text-zinc-400 capitalize">{item.type}</p>
                                    </div>

                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-primary-400 font-bold">
                                            {/* Formatting fallback */}
                                            {formatPrice ? formatPrice(item.price * item.quantity) : `$${(item.price * item.quantity).toFixed(2)}`}
                                        </span>

                                        <div className="flex items-center gap-3">
                                            <span className="text-zinc-500 text-sm">Qty: {item.quantity}</span>
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="text-zinc-500 hover:text-red-400 transition-colors p-1"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="p-6 border-t border-white/10 bg-zinc-900/95 backdrop-blur space-y-4">
                        <div className="flex items-center justify-between text-zinc-400">
                            <span>Subtotal</span>
                            <span className="text-white font-bold text-lg">
                                {formatPrice ? formatPrice(total) : `$${total.toFixed(2)}`}
                            </span>
                        </div>

                        <button
                            onClick={handleCheckout}
                            className="w-full py-3.5 px-4 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white rounded-xl font-bold shadow-lg shadow-primary-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                            Checkout
                        </button>

                        <p className="text-center text-xs text-zinc-600">
                            Tax included. Shipping calculated at checkout.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartDrawer;
