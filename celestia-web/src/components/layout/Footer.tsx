import { useConfig } from '../../context/ConfigContext';
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    const config = useConfig();

    return (
        <footer className="bg-zinc-950 border-t border-white/5 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="space-y-4">
                        <h3 className="text-2xl font-serif text-white">{config.name}</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed">
                            Illuminating pathways to self-discovery through ancient wisdom and modern healing.
                        </p>
                        <div className="flex gap-4 pt-2">
                            {[Instagram, Twitter, Facebook, Youtube].map((Icon, i) => (
                                <a key={i} href="#" className="text-zinc-500 hover:text-primary transition-colors">
                                    <Icon size={20} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="font-medium text-white mb-6">Discovery</h4>
                        <ul className="space-y-3 text-sm text-zinc-400">
                            <li><Link to="/courses" className="hover:text-primary transition-colors">Courses</Link></li>
                            <li><Link to="/readings" className="hover:text-primary transition-colors">Readings</Link></li>
                            <li><Link to="/healings" className="hover:text-primary transition-colors">Healings</Link></li>
                            <li><Link to="/instructors" className="hover:text-primary transition-colors">Our Guides</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-medium text-white mb-6">Support</h4>
                        <ul className="space-y-3 text-sm text-zinc-400">
                            <li><Link to="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
                            <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
                            <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                            <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-medium text-white mb-6">Newsletter</h4>
                        <p className="text-zinc-400 text-sm mb-4">Receive celestial guidance directly to your inbox.</p>
                        <form className="flex gap-2">
                            <input
                                type="email"
                                placeholder="Your email"
                                className="bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm w-full focus:outline-none focus:border-primary/50 text-white"
                            />
                            <button className="bg-primary text-black px-4 py-2 rounded text-sm font-medium hover:bg-primary/90 transition-colors">
                                Join
                            </button>
                        </form>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-8 text-center text-xs text-zinc-600">
                    &copy; {new Date().getFullYear()} {config.name}. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
