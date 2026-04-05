"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await login(email, password);
            if (result.success && result.user) {
                router.push(`/sentinel/rider/homepage?user=${result.user.id}`);
            } else {
                setError(result.error || 'Invalid credentials');
            }
        } catch (err) {
            setError('Connection failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style jsx global>{`
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .glass-panel {
            background: rgba(35, 38, 41, 0.4);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
        }
        .editorial-gradient {
            background: linear-gradient(135deg, #ff8d8f 0%, #bc004f 100%);
        }
      `}</style>

            {/* Ambient Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px]"></div>
                <div className="absolute top-[20%] -right-[5%] w-[40%] h-[40%] rounded-full bg-secondary-container/20 blur-[100px]"></div>
                <div className="absolute bottom-0 left-[20%] w-[60%] h-[30%] rounded-full bg-tertiary/5 blur-[80px]"></div>
            </div>

            {/* Main Canvas */}
            <main className="relative z-10 flex-grow flex flex-col items-center justify-center px-6 py-12">
                {/* Brand Identity Section */}
                <div className="w-full max-w-md mb-12 text-center">
                    <div className="inline-flex items-center justify-center p-4 rounded-3xl bg-surface-container-high shadow-2xl mb-8 relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary opacity-20 blur-xl group-hover:opacity-30 transition-opacity"></div>
                        <span className="material-symbols-outlined text-4xl text-primary relative" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
                    </div>
                    <h1 className="font-headline font-black text-4xl tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                        Sentinel
                    </h1>
                    <p className="font-body text-on-surface-variant text-lg leading-relaxed px-4">
                        Login to Sentinel using the Zomato's Rider Credential
                    </p>
                </div>

                {/* Login Card */}
                <div className="w-full max-w-md glass-panel p-8 rounded-[32px] border border-outline-variant/10 shadow-2xl">
                    {error && (
                        <div className="mb-6 p-4 bg-error-container/20 border border-error-container/40 rounded-2xl text-error text-xs font-bold text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Username/Mobile Field */}
                        <div className="space-y-2">
                            <label className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Email/Mobile No.</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-on-surface-variant group-focus-within:text-primary transition-colors">person</span>
                                </div>
                                <input
                                    className="w-full bg-surface-container-highest border-none rounded-2xl py-4 pl-12 pr-4 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-primary/50 transition-all outline-none"
                                    placeholder="Enter your credentials"
                                    type="text"
                                    style={{ backgroundColor: '#1A1C1E' }}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        {/* Password Field */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">Password</label>
                                <a className="font-label text-xs font-semibold text-secondary hover:text-primary transition-colors" href="#">Forgot Password?</a>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-on-surface-variant group-focus-within:text-primary transition-colors">lock</span>
                                </div>
                                <input
                                    className="w-full bg-surface-container-highest border-none rounded-2xl py-4 pl-12 pr-4 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-primary/50 transition-all outline-none"
                                    placeholder="••••••••"
                                    type="password"
                                    style={{ backgroundColor: '#1A1C1E' }}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <div className="absolute inset-y-0 right-4 flex items-center">
                                    <button className="text-on-surface-variant hover:text-on-surface" type="button">
                                        <span className="material-symbols-outlined text-xl">visibility_off</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                        {/* Action Button */}
                        <button
                            className="w-full editorial-gradient py-5 rounded-2xl font-headline font-extrabold text-white text-lg shadow-lg shadow-secondary-container/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 mt-4"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? "Authenticating..." : "Sign In"}
                        </button>
                    </form>
                    <div className="mt-6 text-center">
                        <p className="font-body text-sm text-on-surface-variant">
                            Not Registered Yet ! ||
                            <Link className="text-secondary font-bold hover:text-primary transition-colors underline-offset-4 hover:underline" href="/sentinel/rider/register">
                                Register here
                            </Link>
                        </p>
                    </div>
                    {/* Social/Partner Footer */}
                    <div className="mt-10 pt-8 border-t border-outline-variant/10 flex flex-col items-center">
                        <p className="font-label text-[10px] uppercase tracking-tighter text-on-surface-variant mb-6">Secured Partner Integration</p>
                        <div className="flex items-center gap-4 grayscale hover:grayscale-0 transition-all duration-500 opacity-80">
                            <div className="flex items-center gap-2">
                                <svg className="h-6 w-6 fill-white" viewBox="0 0 24 24">
                                    <path d="M18.61 2.378a1.554 1.554 0 0 0-1.282.26L2.302 14.124a1.554 1.554 0 0 0 .97 2.766h17.456a1.554 1.554 0 0 0 .97-2.766L6.672 2.638a1.554 1.554 0 0 0-1.282-.26c.72-.185 1.517-.034 2.148.45l11.072 8.496a1.554 1.554 0 1 1-1.94 2.434L5.598 5.262l11.072 8.496a1.554 1.554 0 0 1-1.94 2.434L3.658 7.696l11.072 8.496a1.554 1.554 0 0 1-1.94 2.434L1.718 10.13a1.554 1.554 0 0 0 1.554 2.76h17.456a1.554 1.554 0 0 0 1.554-2.76L18.61 2.378z"></path>
                                </svg>
                                <span className="text-white font-black text-xl tracking-tighter">zomato</span>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Footer Accent */}
                <div className="mt-12 text-center max-w-xs">
                    <p className="font-body text-xs text-on-surface-variant/60 leading-relaxed">
                        By signing in, you agree to our <span className="text-tertiary">Terms of Service</span> and acknowledge our <span className="text-tertiary">Privacy Protection</span> protocol.
                    </p>
                </div>
            </main>

            {/* Decorative Edge Elements */}
            <div className="fixed bottom-12 -left-20 w-64 h-64 rounded-full bg-primary-container/5 blur-[100px] z-0"></div>
            <div className="fixed top-1/2 -right-32 w-80 h-80 rounded-full bg-secondary/10 blur-[120px] z-0"></div>
        </>
    );
}
