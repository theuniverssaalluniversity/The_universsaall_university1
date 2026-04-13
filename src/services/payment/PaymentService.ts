import { supabase } from '../../utils/supabase';
import { loadRazorpay } from './RazorpayAdapter';

export const PaymentService = {

    /**
     * Creates a transaction record in the database
     */
    createTransactionRecord: async (params: {
        userId: string,
        amount: number,
        metadata?: any
    }) => {
        const { data, error } = await supabase.from('transactions').insert({
            user_id: params.userId,
            amount: params.amount,
            currency: 'INR',
            provider: 'razorpay',
            status: 'pending',
            metadata: params.metadata
        }).select().single();

        if (error) {
            console.error('Failed to create transaction record:', error);
            throw new Error('Transaction initialization failed');
        }
        return data;
    },

    /**
     * Updates transaction status
     */
    updateTransactionStatus: async (transactionId: string, status: 'completed' | 'failed', providerId?: string) => {
        const { error } = await supabase.from('transactions').update({
            status,
            provider_transaction_id: providerId,
            updated_at: new Date().toISOString()
        }).eq('id', transactionId);

        if (error) console.error('Failed to update transaction:', error);
    },

    /**
     * Main entry point to start a payment
     * Enforced: INR & Razorpay Only
     */
    async initiatePayment(details: {
        userId: string;
        amount: number; // INR
        currency?: string; // Ignored, always INR
        userEmail: string;
        userName?: string;
        userPhone?: string;
        description?: string;
        metadata?: any;
    }): Promise<any> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        // 1. Create Transaction (Always INR / Razorpay)
        const { data: transaction, error } = await supabase
            .from('transactions')
            .insert({
                user_id: user.id,
                amount: details.amount,
                currency: 'INR',
                provider: 'razorpay',
                status: 'pending',
                metadata: details.metadata
            })
            .select()
            .single();

        if (error) throw error;

        // 2. Load Razorpay
        return loadRazorpay({
            ...details,
            currency: 'INR', // Force INR
            transactionId: transaction.id,
            onSuccess: async (response) => {
                // Update Transaction to Success
                await supabase
                    .from('transactions')
                    .update({
                        status: 'completed',
                        provider_transaction_id: response.razorpay_payment_id
                    })
                    .eq('id', transaction.id);
            },
            onFailure: async (error) => {
                console.error("Payment Failed Callback:", error);
                // Update Transaction to Failed
                await supabase
                    .from('transactions')
                    .update({ status: 'failed' })
                    .eq('id', transaction.id);
            }
        });
    }
};
