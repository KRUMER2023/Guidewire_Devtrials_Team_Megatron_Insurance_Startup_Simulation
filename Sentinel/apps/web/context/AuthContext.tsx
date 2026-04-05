"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

export interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    joined_at: string;
    vehicle_type?: string;
    latitude?: number;
    longitude?: number;
}

export interface RiderStats {
    trust_score: number;
    current_premium: number;
    total_payouts: number;
}

export interface ActivityLog {
    event_type: string;
    h3_index?: string;
    amount: number;
    timestamp: string;
}

export interface AuthState {
    user: User | null;
    stats: RiderStats | null;
    recentLogs: ActivityLog[];
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

interface AuthContextType extends AuthState {
    login: (email: string, password: string) => Promise<{ success: boolean; user?: User; error?: string }>;
    logout: () => void;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = "http://localhost:8000/api/v1";

export function AuthProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<AuthState>({
        user: null,
        stats: null,
        recentLogs: [],
        token: typeof window !== 'undefined' ? localStorage.getItem('gs_token') : null,
        isAuthenticated: false,
        isLoading: true,
        error: null,
    });

    const router = useRouter();

    useEffect(() => {
        if (state.token) {
            refreshProfile();
        } else {
            setState(prev => ({ ...prev, isLoading: false }));
        }
    }, []);

    const refreshProfile = async () => {
        const token = state.token || localStorage.getItem('gs_token');
        if (!token) return;

        try {
            const response = await fetch(`${API_BASE_URL}/rider/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setState(prev => ({
                    ...prev,
                    user: data.user,
                    stats: data.stats,
                    recentLogs: data.recent_logs,
                    isAuthenticated: true,
                    isLoading: false,
                    error: null
                }));
            } else {
                // Token might be expired
                logout();
            }
        } catch (err) {
            console.error("Failed to fetch profile", err);
            setState(prev => ({ ...prev, isLoading: false }));
        }
    };

    const login = async (email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                const data = await response.json();
                const token = data.access_token;
                localStorage.setItem('gs_token', token);

                // Update state with token first so refreshProfile can use it
                setState(prev => ({ ...prev, token }));

                // Fetch full profile
                const profileRes = await fetch(`${API_BASE_URL}/rider/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (profileRes.ok) {
                    const profileData = await profileRes.json();
                    setState(prev => ({
                        ...prev,
                        user: profileData.user,
                        stats: profileData.stats,
                        recentLogs: profileData.recent_logs,
                        token,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null
                    }));
                    return { success: true, user: profileData.user };
                }
            } else {
                const errData = await response.json();
                const errorMessage = errData.detail || "Invalid credentials";
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: errorMessage
                }));
                return { success: false, error: errorMessage };
            }
        } catch (err) {
            const errorMessage = "Server connection failed";
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage
            }));
            return { success: false, error: errorMessage };
        }
        return { success: false, error: "Authentication failed" };
    };

    const logout = () => {
        localStorage.removeItem('gs_token');
        setState({
            user: null,
            stats: null,
            recentLogs: [],
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
        });
        router.push('/sentinel/rider');
    };

    return (
        <AuthContext.Provider value={{ ...state, login, logout, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
