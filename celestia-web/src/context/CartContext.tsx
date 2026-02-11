import React, { createContext, useContext, useState, useEffect } from 'react';

export type CartItemType = 'course' | 'product' | 'service';

export interface CartItem {
    id: string; // unique cart item id
    itemId: string; // The actual product/service/course ID
    type: CartItemType;
    title: string;
    // We store the 'price' as the FINAL INR value to simplifylogic
    price: number;
    price_inr?: number;
    image?: string;
    quantity: number;
    metadata?: any; // To store extras like birth details requirement
}

interface CartContextType {
    items: CartItem[];
    addItem: (item: Omit<CartItem, 'id'>) => void;
    removeItem: (itemId: string) => void;
    clearCart: () => void;
    updateQuantity: (itemId: string, quantity: number) => void;
    total: number;
    isOpen: boolean;
    toggleCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    // Load from LocalStorage
    useEffect(() => {
        const savedCart = localStorage.getItem('celestia_cart');
        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart));
            } catch (e) {
                console.error("Failed to parse cart", e);
            }
        }
    }, []);

    // Save to LocalStorage
    useEffect(() => {
        localStorage.setItem('celestia_cart', JSON.stringify(items));
    }, [items]);

    const addItem = (newItem: Omit<CartItem, 'id'>) => {
        setItems(prev => {
            const existing = prev.find(i => i.itemId === newItem.itemId && i.type === newItem.type);
            if (existing) {
                return prev.map(i =>
                    (i.itemId === newItem.itemId && i.type === newItem.type)
                        ? { ...i, quantity: i.quantity + newItem.quantity }
                        : i
                );
            }
            return [...prev, { ...newItem, id: crypto.randomUUID() }];
        });
        setIsOpen(true);
    };

    const updateQuantity = (itemId: string, quantity: number) => {
        if (quantity < 1) {
            removeItem(itemId);
            return;
        }
        setItems(prev => prev.map(item =>
            item.id === itemId ? { ...item, quantity } : item
        ));
    };

    const removeItem = (cartItemId: string) => {
        setItems(prev => prev.filter(i => i.id !== cartItemId));
    };

    const clearCart = () => {
        setItems([]);
    };

    const toggleCart = () => setIsOpen(prev => !prev);

    // INR Total Calculation
    const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, isOpen, toggleCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
