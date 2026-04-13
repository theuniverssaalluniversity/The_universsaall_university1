import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../utils/supabase';
import type { UserRole } from '../types';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    role: UserRole | null;
    uniqueId?: string | null;
    loading: boolean;
    isAdmin: boolean;
    isInstructor: boolean;
    isSupport: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<UserRole | null>(null);
    const [loading, setLoading] = useState(true);

    // Use refs to track state without triggering re-renders inside the listener
    const userIdRef = React.useRef<string | null>(null);

    // SAFETY TIMEOUT: Separate effect to track 'loading' changes correctly
    useEffect(() => {
        let timeout: ReturnType<typeof setTimeout>;

        if (loading) {
            timeout = setTimeout(() => {
                console.warn("Auth check timed out (5s). Force releasing state.");
                // 1. Force Local State Reset
                setSession(null);
                setUser(null);
                setRole(null);
                userIdRef.current = null;
                setLoading(false);

                // 2. Try Supabase Cleanup
                supabase.auth.signOut().catch(() => { });

                // 3. Clear Local Storage
                const key = Object.keys(localStorage).find(k => k.startsWith('sb-') && k.endsWith('-auth-token'));
                if (key) localStorage.removeItem(key);
            }, 5000);
        }

        return () => clearTimeout(timeout);
    }, [loading]);

    useEffect(() => {
        let mounted = true;

        // 1. Get initial session
        const initAuth = async () => {
            try {
                const { data: { session: initSession } } = await supabase.auth.getSession();
                if (!mounted) return;

                setSession(initSession);
                setUser(initSession?.user ?? null);

                if (initSession?.user) {
                    userIdRef.current = initSession.user.id;
                    await fetchUserRole(initSession.user.id);
                } else {
                    setLoading(false);
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
                if (mounted) setLoading(false);
            }
        };

        initAuth();

        // 2. Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
            if (!mounted) return;
            // console.log('Auth Event:', event, newSession?.user?.id);

            // 1. Silent Refresh or Tab Switch (Same User)
            if (event === 'TOKEN_REFRESHED' || (event === 'SIGNED_IN' && newSession?.user?.id === userIdRef.current)) {
                setSession(newSession);
                // DO NOT set loading=true or re-fetch role. We are already good.
                return;
            }

            // 2. New User or Initial Sign In
            setSession(newSession);
            setUser(newSession?.user ?? null);
            const newUserId = newSession?.user?.id ?? null;

            if (newUserId && (newUserId !== userIdRef.current || !role)) {
                userIdRef.current = newUserId;

                // Only show loading if we are NOT already verifying
                if (!loading) setLoading(true); // Re-trigger timeout protection only for NEW logins

                await fetchUserRole(newUserId);
            } else if (!newUserId) {
                // Signed out
                userIdRef.current = null;
                setRole(null);
                setLoading(false);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const [uniqueId, setUniqueId] = useState<string | null>(null);

    const fetchUserRole = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('role, unique_id')
                .eq('id', userId)
                .single();

            if (data) {
                setRole(data.role);
                setUniqueId(data.unique_id);
            } else if (error) {
                console.error('Error fetching role:', error);
                setRole('student');
            }
        } catch (err) {
            console.error('Role fetch exception:', err);
        } finally {
            setLoading(false);
        }
    };

    const value = {
        session,
        user,
        role,
        uniqueId,
        loading,
        isAdmin: role === 'admin',
        isInstructor: role === 'instructor',
        isSupport: role === 'support' || role === 'admin'
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
