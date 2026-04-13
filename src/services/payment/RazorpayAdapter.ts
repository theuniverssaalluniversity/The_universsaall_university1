import type { RazorpayResponse } from '../../types/razorpay';

const RAZORPAY_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js';

interface RazorpayParams {
    amount: number;
    currency: string;
    userEmail: string;
    userName?: string;
    userPhone?: string;
    description?: string;
    transactionId: string;
    onSuccess: (response: RazorpayResponse) => Promise<any>;
    onFailure: (error: any) => Promise<any>;
}

// Helper to load script
const loadScript = (src: string) => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

export const loadRazorpay = async (params: RazorpayParams): Promise<RazorpayResponse> => {
    const res = await loadScript(RAZORPAY_SCRIPT);

    if (!res) {
        alert('Razorpay SDK failed to load. Are you online?');
        throw new Error('Razorpay SDK failed to load');
    }

    return new Promise((resolve, reject) => {
        // Use placeholder key if env not set
        const key = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_PLACEHOLDER';

        const options = {
            key: key,
            amount: params.amount * 100, // Razorpay works in subunits (paise)
            currency: params.currency,
            name: "Universal University",
            description: params.description || "Course/Product Purchase",
            // image: "/logo.png", // Commented out to avoid localhost CORS/Mixed Content issues
            handler: async function (response: RazorpayResponse) {
                console.log("PAYMENT SUCCESS:", response);
                await params.onSuccess(response);
                resolve(response); // Resolve the main promise!
                // window.location.href = '/success'; // REMOVED: Let caller handle redirect
            },
            prefill: {
                name: params.userName || '',
                email: params.userEmail || '',
                contact: params.userPhone || ''
            },
            notes: {
                transaction_id: params.transactionId
            },
            theme: {
                color: "#D4AF37",
            }
        };

        const paymentObject = new window.Razorpay(options);

        paymentObject.on('payment.failed', function (response: any) {
            console.error("PAYMENT FAILED:", response.error);
            // alert(`Payment Failed: ${response.error.description}`); // Optional: Let UI handle alert
            params.onFailure(response.error);
            reject(new Error(response.error.description));
        });

        paymentObject.open();
    });
};
