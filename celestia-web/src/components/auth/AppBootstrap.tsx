import React, { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase';

// FORCE TIMEOUT MSG
const FORCE_RESET_MSG = "Connection hangs. Forcing reset.";

export const AppBootstrap = ({ children }: { children: React.ReactNode }) => {
    const [isReady, setIsReady] = useState(false);
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        let mounted = true;

        const checkConnection = async () => {
            // 1. Race Condition: Database Ping vs Timeout
            // If DB doesn't answer in 2000ms, we assume "Zombie State" and kill it.

            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error(FORCE_RESET_MSG)), 2500)
            );

            // We perform a very cheap check: Get the current session (local) 
            // AND try one network request (e.g. fetch count of an open table or just session refresh)
            // Ideally getting session is enough, but if token is stale, getSession() might hang in some versions.
            // Let's force a network handshake.
            const networkCheckPromise = supabase.auth.getSession();

            try {
                await Promise.race([networkCheckPromise, timeoutPromise]);
                // If we get here, Supabase client is at least responsive (or errored fast)
                if (mounted) setIsReady(true);
            } catch (err: any) {
                console.warn("Bootstrap Warning:", err);

                // If it was our forced timeout, NUCLEAR OPTION
                if (err.message === FORCE_RESET_MSG || err.toString().includes(FORCE_RESET_MSG)) {
                    console.error("CRITICAL: App failed to bootstrap. Clearing session and retrying.");

                    // 1. Clear Supabase LocalStorage
                    const key = Object.keys(localStorage).find(k => k.startsWith('sb-') && k.endsWith('-auth-token'));
                    if (key) localStorage.removeItem(key);

                    // 2. Sign Out (fire and forget)
                    supabase.auth.signOut().catch(() => { });

                    // 3. Force Retry (once) or Just Load
                    if (retryCount < 1) {
                        setRetryCount(prev => prev + 1);
                        // Trigger re-run
                        return;
                    }
                }

                // If we failed twice or it was a different error, just let the app render.
                // Better to render in "Guest Mode" than freeze.
                if (mounted) setIsReady(true);
            }
        };

        checkConnection();

        return () => { mounted = false; };
    }, [retryCount]);

    if (!isReady) {
        // High-End Loading Screen (Brand Aligned)
        return (
            <div style={{
                height: '100vh',
                width: '100vw',
                backgroundColor: '#09090b', // zinc-950
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'serif',
                gap: '1rem'
            }}>
                <div style={{
                    fontSize: '2rem',
                    color: '#d4af37', // Gold 
                    fontWeight: 500,
                    letterSpacing: '0.05em',
                    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }}>
                    Narayan Narayan
                </div>
                <div style={{
                    fontSize: '0.875rem',
                    color: '#71717a', // zinc-500
                    textTransform: 'uppercase',
                    letterSpacing: '0.2em',
                    fontWeight: 300
                }}>
                    we are just loading
                </div>
                <style>{`
                    @keyframes pulse {
                        0%, 100% { opacity: 1; }
                        50% { opacity: .5; }
                    }
                `}</style>
            </div>
        );
    }

    return <>{children}</>;
};
