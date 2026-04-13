import { supabase } from './supabase';

export interface EmailOptions {
    to: string;
    subject: string;
    body: string; // HTML or Text
}

export const sendEmail = async (options: EmailOptions) => {
    console.log(`[Email Mock] Sending to ${options.to}: ${options.subject}`);

    // Simulate Network Delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Log to Database (Simulating SMTP success)
    const { error } = await supabase
        .from('email_logs')
        .insert({
            recipient_email: options.to,
            subject: options.subject,
            body: options.body,
            status: 'sent'
        });

    if (error) {
        console.error('[Email Mock] Failed to log email:', error);
        return false;
    }

    return true;
};

// Templates
export const emailTemplates = {
    orderConfirmation: (orderId: string, total: string) => ({
        subject: `Order Confirmation #${orderId.slice(0, 8)}`,
        body: `<h1>Thank you for your order!</h1><p>Your order #${orderId.slice(0, 8)} has been confirmed.</p><p>Total: ${total}</p>`
    }),
    orderStatusUpdate: (orderId: string, status: string) => ({
        subject: `Order Status Update #${orderId.slice(0, 8)}`,
        body: `<h1>Order Update</h1><p>Your order #${orderId.slice(0, 8)} is now <strong>${status}</strong>.</p>`
    })
};
