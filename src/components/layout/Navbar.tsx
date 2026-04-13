import { Link, useLocation } from 'react-router-dom';
import { useConfig } from '../../context/ConfigContext';
// import { useCurrency } from '../../context/CurrencyContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Menu, ShoppingBag, User, ExternalLink, ChevronDown } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

import { supabase } from '../../utils/supabase';

const Navbar = () => {
    const config = useConfig();
    const { user, role } = useAuth();
    // const { currency } = useCurrency(); // Removed unused
    const { toggleCart, items } = useCart();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            const { data } = await supabase
                .from('service_categories')
                .select('id, title, slug, type, redirect_url, parent_id')
                .order('sort_order', { ascending: true });
            if (data) setCategories(data);
        };
        fetchCategories();
    }, []);

    const navLinks = useMemo(() => {
        // Base links
        const items: any[] = [{ name: 'Courses', path: '/courses', isExternal: false }];

        // Build Tree from Categories
        const roots = categories.filter(c => !c.parent_id);

        roots.forEach(root => {
            const children = categories.filter(c => c.parent_id === root.id).map(child => ({
                name: child.title,
                path: child.type === 'link' ? child.redirect_url : `/services/${child.slug}`,
                isExternal: child.type === 'link'
            }));

            items.push({
                name: root.title,
                path: root.type === 'link' ? root.redirect_url : `/services/${root.slug}`,
                isExternal: root.type === 'link',
                children
            });
        });

        items.push({ name: 'Shop', path: '/shop', isExternal: false });

        return items;
    }, [categories]);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/5 pt-[env(safe-area-inset-top)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 group">
                        {config.logo_url ? (
                            <img
                                src={config.logo_url}
                                alt={config.name}
                                className="h-12 w-auto object-contain group-hover:opacity-90 transition-opacity"
                            />
                        ) : (
                            <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-serif font-bold text-xl ring-1 ring-primary/20 group-hover:ring-primary/50 transition-all">
                                {config.name.charAt(0)}
                            </div>
                        )}
                        <span className="text-2xl font-serif font-medium tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 group-hover:text-primary transition-colors duration-300">
                            {config.name}
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link: any) => (
                            <div key={link.name} className="relative group/menu">
                                {link.children && link.children.length > 0 ? (
                                    <>
                                        <Link
                                            to={link.path}
                                            onClick={(e) => { if (!link.path) e.preventDefault(); }}
                                            className={clsx(
                                                "flex items-center gap-1.5 text-sm font-medium transition-colors py-2 group-hover/menu:text-primary",
                                                location.pathname.startsWith(link.path) ? "text-primary" : "text-muted-foreground"
                                            )}
                                        >
                                            {link.name}
                                            <ChevronDown size={14} className="group-hover/menu:rotate-180 transition-transform duration-300" />
                                        </Link>

                                        <div className="absolute top-full left-0 w-56 pt-4 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all duration-200 transform group-hover/menu:translate-y-0 translate-y-2 z-50">
                                            <div className="bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-xl p-2 shadow-2xl flex flex-col gap-1 ring-1 ring-black/50 overflow-hidden">
                                                {link.children.map((child: any) => (
                                                    child.isExternal ? (
                                                        <a
                                                            key={child.name}
                                                            href={child.path}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                                        >
                                                            {child.name}
                                                            <ExternalLink size={12} className="opacity-50" />
                                                        </a>
                                                    ) : (
                                                        <Link
                                                            key={child.path}
                                                            to={child.path}
                                                            className="block px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                                        >
                                                            {child.name}
                                                        </Link>
                                                    )
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    link.isExternal ? (
                                        <a
                                            key={link.name}
                                            href={link.path}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary relative group flex items-center gap-1"
                                        >
                                            {link.name}
                                            <ExternalLink size={12} className="opacity-50" />
                                        </a>
                                    ) : (
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
                                    )
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="hidden md:flex items-center gap-4">
                        {/* Currency Switcher Removed */}
                        <button
                            onClick={toggleCart}
                            className="p-2 text-muted-foreground hover:text-primary transition-colors relative"
                        >
                            <ShoppingBag size={20} />
                            {items.length > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-[10px] text-black font-bold flex items-center justify-center rounded-full">
                                    {items.length}
                                </span>
                            )}
                        </button>

                        {user ? (
                            <Link to={`/${role || 'student'}`} className="px-5 py-2 rounded-full bg-primary text-black text-sm font-medium transition-all hover:bg-primary/90 flex items-center gap-2">
                                <User size={16} />
                                <span>Dashboard</span>
                            </Link>
                        ) : (
                            <Link to="/login" className="px-5 py-2 rounded-full bg-white/5 border border-white/10 hover:border-primary/50 text-sm font-medium transition-all hover:bg-white/10 flex items-center gap-2">
                                <User size={16} />
                                <span>Login</span>
                            </Link>
                        )}
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
