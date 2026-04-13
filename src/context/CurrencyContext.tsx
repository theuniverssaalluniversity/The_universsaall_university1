import React, { createContext, useContext } from 'react';

// Single Source of Truth: INR Only
type Currency = 'INR';

interface CurrencyContextType {
    currency: Currency;
    formatPrice: (amount: number, secondary?: number) => string;
    symbol: string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: React.ReactNode }) => {

    // Simplest possible formatter for Indian Rupees
    const formatPrice = (amount: number, _secondary?: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <CurrencyContext.Provider value={{
            currency: 'INR',
            formatPrice,
            symbol: '₹'
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
