import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import CartDrawer from '../components/cart/CartDrawer';

const PublicLayout = () => {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />
            <CartDrawer />
            <main className="flex-grow pt-20">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default PublicLayout;
