import React, { createContext, useContext, useState, useEffect } from 'react';

type Currency = 'USD' | 'INR';

interface CurrencyContextType {
    currency: Currency;
    setCurrency: (c: Currency) => void;
    formatPrice: (price: number, priceInr?: number) => string;
    symbol: string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: React.ReactNode }) => {
    const [currency, setCurrency] = useState<Currency>('INR'); // Default to INR

    // Persist preference
    useEffect(() => {
        const stored = localStorage.getItem('celestia_currency');
        if (stored === 'USD' || stored === 'INR') {
            setCurrency(stored);
        }
    }, []);

    const handleSetCurrency = (c: Currency) => {
        setCurrency(c);
        localStorage.setItem('celestia_currency', c);
    };

    const formatPrice = (priceUsd: number, priceInr?: number) => {
        if (currency === 'INR') {
            // Use explicit INR price if available, otherwise conversion fallback (e.g. 1 USD = 83 INR)
            const val = priceInr || (priceUsd * 83);
            return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
        } else {
            return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(priceUsd);
        }
    };

    return (
        <CurrencyContext.Provider value={{
            currency,
            setCurrency: handleSetCurrency,
            formatPrice,
            symbol: currency === 'INR' ? '₹' : '$'
        }}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (!context) throw new Error('useCurrency must be used within CurrencyProvider');
    return context;
};
