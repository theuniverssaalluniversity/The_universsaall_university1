import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useConfig } from '../context/ConfigContext';
import { supabase } from '../utils/supabase';
import {
    LayoutDashboard, BookOpen, Users, ShoppingBag,
    Settings, LogOut, Menu, X, Bell, Shield, LifeBuoy
} from 'lucide-react';
import clsx from 'clsx';

const DashboardLayout = ({ role }: { role: 'student' | 'instructor' | 'admin' | 'support' }) => {
    const config = useConfig();
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile) setSidebarOpen(false);
            else setSidebarOpen(true);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    const menuItems = {
        student: [
            { name: 'Dashboard', icon: LayoutDashboard, path: '/student' },
            { name: 'My Courses', icon: BookOpen, path: '/student/courses' },
            { name: 'My Orders', icon: ShoppingBag, path: '/student/orders' },
        ],
        instructor: [
            { name: 'Dashboard', icon: LayoutDashboard, path: '/instructor' },
            { name: 'My Courses', icon: BookOpen, path: '/instructor/courses' },
            { name: 'Students', icon: Users, path: '/instructor/students' },
            { name: 'Earnings', icon: ShoppingBag, path: '/instructor/earnings' },
        ],
        admin: [
            { name: 'Overview', icon: LayoutDashboard, path: '/admin' },
            { name: 'Staff', icon: Users, path: '/admin/staff' },
            { name: 'Revenue', icon: ShoppingBag, path: '/admin/revenue' },
            { name: 'Logs', icon: Shield, path: '/admin/logs' },
            { name: 'Settings', icon: Settings, path: '/admin/settings' },
        ],
        support: [
            { name: 'Dashboard', icon: LayoutDashboard, path: '/support' },
            { name: 'Orders', icon: ShoppingBag, path: '/support/orders' },
            { name: 'Enrollments', icon: Users, path: '/support/enrollments' },
            { name: 'Chat', icon: LifeBuoy, path: '/support/chat' },
        ]
    };

    const currentMenu = menuItems[role] || menuItems.student;

    return (
        <div className="min-h-screen bg-background flex text-white font-sans">
            {/* Sidebar */}
            <aside className={clsx(
                "fixed md:static inset-y-0 left-0 z-40 w-64 bg-zinc-900 border-r border-white/5 transform transition-transform duration-300 ease-in-out flex flex-col",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0 md:w-20 lg:w-64"
            )}>
                <div className="h-20 flex items-center px-6 border-b border-white/5">
                    {config.logo_url ? (
                        <img src={config.logo_url} className="h-8 w-8 rounded-full" />
                    ) : (
                        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-black font-bold">
                            {config.name.charAt(0)}
                        </div>
                    )}
                    <span className={clsx("ml-3 font-serif text-lg font-medium transition-opacity duration-300",
                        !isSidebarOpen && "md:hidden lg:block lg:opacity-100"
                    )}>
                        {config.name}
                    </span>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {currentMenu.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={clsx(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group",
                                location.pathname === item.path
                                    ? "bg-primary text-black font-medium"
                                    : "text-zinc-400 hover:bg-white/5 hover:text-white"
                            )}
                        >
                            <item.icon size={20} />
                            <span className={clsx(
                                "transition-opacity duration-300",
                                !isSidebarOpen && "md:hidden lg:block lg:opacity-100"
                            )}>
                                {item.name}
                            </span>
                            {/* Tooltip for collapsed mode */}
                            {!isSidebarOpen && !isMobile && (
                                <div className="absolute left-16 bg-zinc-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap md:block lg:hidden pointer-events-none z-50">
                                    {item.name}
                                </div>
                            )}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/5">
                    <button
                        onClick={handleLogout}
                        className={clsx(
                            "flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-400 hover:bg-red-400/10 transition-colors",
                            !isSidebarOpen && "justify-center md:justify-center lg:justify-start"
                        )}
                    >
                        <LogOut size={20} />
                        <span className={clsx(
                            "transition-opacity duration-300",
                            !isSidebarOpen && "md:hidden lg:block lg:opacity-100"
                        )}>
                            Logout
                        </span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="h-20 border-b border-white/5 bg-zinc-900/50 backdrop-blur sticky top-0 z-30 flex items-center justify-between px-6">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5">
                            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                        <h2 className="text-xl font-medium text-white capitalize">
                            {role} Portal
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-2 text-zinc-400 hover:text-white relative">
                            <Bell size={20} />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
                        </button>
                        <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10" />
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6 md:p-8 overflow-y-auto">
                    <Outlet />
                </main>
            </div>

            {/* Mobile Overlay */}
            {isMobile && isSidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
                />
            )}
        </div>
    );
};

export default DashboardLayout;
