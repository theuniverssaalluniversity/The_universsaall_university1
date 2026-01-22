import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '../../utils/supabase';
import type { UserRole } from '../../types';

interface RoleGuardProps {
    allowedRoles: UserRole[];
}

const RoleGuard = ({ allowedRoles }: RoleGuardProps) => {
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);
    const [userRole, setUserRole] = useState<UserRole | null>(null);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setLoading(false);
                return;
            }

            // Check role in DB
            const { data } = await supabase
                .from('users')
                .select('role')
                .eq('id', user.id)
                .single();

            const role = data?.role || 'student';
            setUserRole(role);

            if (allowedRoles.includes(role)) {
                setAuthorized(true);
            }

            setLoading(false);
        };

        checkUser();
    }, [allowedRoles]);

    if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-zinc-500">Verifying Access...</div>;

    if (!authorized) {
        if (userRole) {
            // Logged in but wrong role -> redirect to their home
            if (userRole === 'admin') return <Navigate to="/admin" />;
            if (userRole === 'instructor') return <Navigate to="/instructor" />;
            if (userRole === 'support') return <Navigate to="/support" />;
            return <Navigate to="/student" />;
        }
        // Not logged in
        return <Navigate to="/login" />;
    }

    return <Outlet />;
};

export default RoleGuard;
