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
            // STRICT MODE: We DO NOT render until we confirm DB is traceable.
            try {
                // 1. Simple Trace: Get Session
                const { error } = await supabase.auth.getSession();

                if (error) {
                    console.warn("Session check failed, but client might be reachable via public", error);
                }

                // 2. Data Trace: Try to select count from a public table (e.g. service_categories or services)
                // This proves the DB itself is responding to queries, not just the Auth server.
                const { data, error: dbError } = await supabase
                    .from('service_categories')
                    .select('id')
                    .limit(1)
                    .maybeSingle();

                if (dbError) throw dbError;

                // If we reach here, we are CONNECTED.
                if (mounted) setIsReady(true);

            } catch (err) {
                console.error("Database connection failed. Retrying in 2s...", err);

                if (retryCount < 3) {
                    setTimeout(() => {
                        if (mounted) setRetryCount(prev => prev + 1);
                    }, 2000);
                } else {
                    // Falls back to error screen or eventually gives up, 
                    // BUT we do NOT set isReady(true) to avoid zombie UI.
                }
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
