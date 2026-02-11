import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, LayoutDashboard } from 'lucide-react';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';

const useWindowSize = () => {
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return windowSize;
};

const SuccessPage = () => {
    const { width, height } = useWindowSize();
    const navigate = useNavigate();

    // Auto-redirect to dashboard after 10 seconds (optional)
    useEffect(() => {
        const timer = setTimeout(() => navigate('/student/orders'), 10000);
        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <Confetti
                width={width}
                height={height}
                numberOfPieces={200}
                recycle={false}
                colors={['#D4AF37', '#FFFFFF', '#facc15']}
            />

            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="max-w-md w-full bg-zinc-900/50 border border-white/10 backdrop-blur-xl p-8 rounded-3xl text-center shadow-2xl relative z-10"
            >
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500 border border-green-500/20">
                    <CheckCircle size={40} />
                </div>

                <h1 className="text-3xl font-serif text-white mb-2">Payment Successful!</h1>
                <p className="text-zinc-400 mb-8">
                    Thank you for your purchase. Your order has been confirmed and courses have been added to your dashboard.
                </p>

                <div className="space-y-3">
                    <Link
                        to="/student"
                        className="block w-full py-4 bg-primary text-black font-bold rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                    >
                        <LayoutDashboard size={20} />
                        Go to Dashboard
                    </Link>

                    <Link
                        to="/student/orders"
                        className="block w-full py-4 bg-zinc-800 text-white font-medium rounded-xl hover:bg-zinc-700 transition-all flex items-center justify-center gap-2"
                    >
                        View Order Details <ArrowRight size={18} />
                    </Link>
                </div>
            </motion.div>

            <div className="absolute bottom-8 text-zinc-600 text-sm">
                Redirecting you shortly...
            </div>
        </div>
    );
};

export default SuccessPage;
