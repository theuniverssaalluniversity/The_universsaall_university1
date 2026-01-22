import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import type { OrganizationConfig } from '../types';

const defaultConfig: OrganizationConfig = {
    name: "Celestia", // Default fallback
    theme_colors: {
        primary: "#d4af37",
        secondary: "#27272a",
        accent: "#f59e0b"
    }
};

const ConfigContext = createContext<OrganizationConfig>(defaultConfig);

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [config, setConfig] = useState<OrganizationConfig>(defaultConfig);

    useEffect(() => {
        const fetchConfig = async () => {
            // Fetch the first organization config for now. 
            // In production, this could be based on the domain or a specific ID.
            const { data, error } = await supabase
                .from('organizations')
                .select('*')
                .limit(1)
                .single();

            if (data && !error) {
                const newConfig = {
                    name: data.name,
                    logo_url: data.logo_url,
                    theme_colors: data.theme_colors
                };
                setConfig(newConfig);

                // Update CSS variables for Tailwind
                if (data.theme_colors) {
                    document.documentElement.style.setProperty('--primary', data.theme_colors.primary);
                    document.documentElement.style.setProperty('--secondary', data.theme_colors.secondary);
                    document.documentElement.style.setProperty('--accent', data.theme_colors.accent);
                }

                // Update Document Title
                document.title = data.name;
            }
        };

        fetchConfig();
    }, []);

    return (
        <ConfigContext.Provider value={config}>
            {children}
        </ConfigContext.Provider>
    );
};

export const useConfig = () => useContext(ConfigContext);
