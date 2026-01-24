import { Link, useLocation } from 'react-router-dom';
import { useConfig } from '../../context/ConfigContext';
import { useCurrency } from '../../context/CurrencyContext';
import { Menu, ShoppingBag, User } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

const Navbar = () => {
    const config = useConfig();
    const { currency, setCurrency } = useCurrency();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navLinks = [
        { name: 'Courses', path: '/courses' },
        { name: 'Readings', path: '/readings' },
        { name: 'Healings', path: '/healings' },
        { name: 'Shop', path: '/shop' },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 group">
                        {config.logo_url ? (
                            <img src={config.logo_url} alt={config.name} className="h-10 w-10 rounded-full ring-2 ring-primary/20 group-hover:ring-primary/50 transition-all" />
                        ) : (
                            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-serif font-bold text-xl ring-2 ring-primary/20 group-hover:ring-primary/50 transition-all">
                                {config.name.charAt(0)}
                            </div>
                        )}
                        <span className="text-2xl font-serif font-medium tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 group-hover:text-primary transition-colors duration-300">
                            {config.name}
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={clsx(
                                    "text-sm font-medium transition-colors hover:text-primary relative group",
                                    location.pathname === link.path ? "text-primary" : "text-muted-foreground"
                                )}
                            >
                                {link.name}
                                <span className={clsx(
                                    "absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full",
                                    location.pathname === link.path && "w-full"
                                )} />
                            </Link>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="hidden md:flex items-center gap-4">
                        <button
                            onClick={() => setCurrency(currency === 'USD' ? 'INR' : 'USD')}
                            className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-white hover:bg-white/10 transition-colors flex items-center gap-2"
                        >
                            <span className={currency === 'USD' ? 'text-primary' : 'text-zinc-500'}>$</span>
                            <span className="w-px h-3 bg-white/10"></span>
                            <span className={currency === 'INR' ? 'text-primary' : 'text-zinc-500'}>₹</span>
                        </button>
                        <Link to="/cart" className="p-2 text-muted-foreground hover:text-primary transition-colors">
                            <ShoppingBag size={20} />
                        </Link>
                        <Link to="/login" className="px-5 py-2 rounded-full bg-white/5 border border-white/10 hover:border-primary/50 text-sm font-medium transition-all hover:bg-white/10 flex items-center gap-2">
                            <User size={16} />
                            <span>Login</span>
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 text-muted-foreground hover:text-foreground"
                    >
                        <Menu size={24} />
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-t border-white/5 bg-background/95 backdrop-blur-xl"
                    >
                        <div className="px-4 py-6 space-y-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block text-lg font-medium text-muted-foreground hover:text-primary transition-colors"
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div className="pt-4 border-t border-white/5 flex flex-col gap-3">
                                <Link to="/login" className="w-full py-3 rounded-lg bg-primary/10 border border-primary/20 text-primary text-center font-medium">
                                    Login / Register
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
