"use client";

import React, { useState, useEffect } from 'react';
import { Shield, Mail, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function RiderLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, error, isLoading, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isAuthenticated) {
            router.push('/gigshield/rider/dashboard');
        }
    }, [isAuthenticated, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await login(email, password);
        if (success) {
            router.push('/gigshield/rider/dashboard');
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#6366f1]/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#a855f7]/10 blur-[120px] rounded-full pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-[#6366f1] rounded-2xl shadow-[0_0_20px_rgba(99,102,241,0.4)] mb-4">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Rider Access</h1>
                    <p className="text-[#908fa0]">Secure your gig with AI-powered protection</p>
                </div>

                <div className="bg-[#111827]/80 backdrop-blur-xl border border-[#31353f] rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#6366f1] via-[#a855f7] to-[#6366f1]" />

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <AnimatePresence mode="wait">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-center gap-3 text-red-400 text-sm"
                                >
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span>{error}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-[#908fa0] uppercase tracking-widest ml-1">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="w-4 h-4 text-[#4b5563] group-focus-within:text-[#6366f1] transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full bg-[#0a0e17] border border-[#31353f] text-white text-sm rounded-xl py-3 pl-11 pr-4 focus:ring-2 focus:ring-[#6366f1]/40 focus:border-[#6366f1] outline-none transition-all placeholder:text-[#4b5563]"
                                    placeholder="name@gig.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-[#908fa0] uppercase tracking-widest ml-1">Secure Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="w-4 h-4 text-[#4b5563] group-focus-within:text-[#6366f1] transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full bg-[#0a0e17] border border-[#31353f] text-white text-sm rounded-xl py-3 pl-11 pr-4 focus:ring-2 focus:ring-[#6366f1]/40 focus:border-[#6366f1] outline-none transition-all placeholder:text-transparent"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#6366f1] hover:bg-[#4f46e5] text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)] flex items-center justify-center gap-2 group active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Connect to Dashboard
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-[#31353f] text-center">
                        <p className="text-xs text-[#4b5563]">
                            Need help? Contact <span className="text-[#6366f1] cursor-pointer hover:underline">GigShield Support</span>
                        </p>
                    </div>
                </div>

                {/* Mock Credentials Note for Preview */}
                <div className="mt-6 p-4 rounded-xl border border-dashed border-[#31353f] bg-white/5">
                    <p className="text-[10px] text-[#908fa0] text-center uppercase tracking-widest mb-2 font-bold">Simulator Login (Preview)</p>
                    <div className="flex justify-around text-[11px] font-mono text-zinc-400">
                        <div>User: <span className="text-[#6366f1]">raju@gig.com</span></div>
                        <div>Pass: <span className="text-[#6366f1]">password123</span></div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
