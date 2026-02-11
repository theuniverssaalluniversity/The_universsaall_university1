export type UserRole = 'student' | 'instructor' | 'support' | 'admin';

export interface User {
    id: string;
    email: string;
    full_name: string;
    avatar_url?: string;
    role: UserRole;
    unique_id?: string;
}

export interface OrganizationConfig {
    name: string;
    logo_url?: string;
    theme_colors: {
        primary: string;
        secondary: string;
        accent: string;
    };
}
