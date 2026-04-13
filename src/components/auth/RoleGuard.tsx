import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types';

interface RoleGuardProps {
    allowedRoles: UserRole[];
}

const RoleGuard = ({ allowedRoles }: RoleGuardProps) => {
    const { user, role, loading } = useAuth();
    // Logic simplified: Context handles fetching. We just check state.

    if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-zinc-500">Verifying Access...</div>;

    if (!user || !role) {
        return <Navigate to="/login" />;
    }

    if (!allowedRoles.includes(role)) {
        // Redirect based on actual role
        if (role === 'admin') return <Navigate to="/admin" />;
        if (role === 'instructor') return <Navigate to="/instructor" />;
        if (role === 'support') return <Navigate to="/support" />;
        return <Navigate to="/student" />;
    }

    return <Outlet />;
};

export default RoleGuard;
