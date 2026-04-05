"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
// Removed framer-motion to maintain absolute UI fidelity

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [verifiedUser, setVerifiedUser] = useState<any>(null);
    const router = useRouter();

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:8000/api/v1/auth/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, phone, password }),
            });

            const data = await response.json();

            if (response.ok) {
                setVerifiedUser(data);
            } else {
                setError(data.detail || 'Verification failed. enter correct password as zomato credentials');
            }
        } catch (err) {
            setError('Connection failed. Please ensure backend is running.');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmRegistration = () => {
        router.push('/sentinel/rider/login');
    };

    return (
        <>
            <style jsx global>{`
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .glass-panel {
            background: rgba(35, 38, 41, 0.4);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
        }
      `}</style>

            {/* Background Decorative Elements */}
            <div className="fixed inset-0 -z-10 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-secondary-container/20 blur-[120px]"></div>
                <div className="absolute bottom-[-5%] left-[-5%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[100px]"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-10" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD325OM_JUTtpnNDT7G5NYlj1tdZWaZ1WNDj5mTbmRNw_NOiQnVkX_Xct695gwXEbvxHDnStOu_O5wVTUlvMhvVq8u70M5UyChdyhKuHT87TjcEa1mHsb_LZIMOQiTBnvhZ4a4MocZs8mQpcaiSuq7HqgSERX6g_ygAj6U1g_qjF_bQGdlC-A82TA7FuHsAKFz64mUT9sQ6P3rI16M354at_3aMxWaS_Fm0DLFNzL7jP6stOz1QKTzPi5MysWA_IGmNJzEjrXxrGAc')" }}></div>
            </div>

            {/* Header */}
            <header className="sticky top-0 z-50 flex items-center justify-center h-20 px-6 bg-stone-950/40 backdrop-blur-2xl">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-3xl" data-icon="shield">shield</span>
                    <span className="font-epilogue font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-pink-600 text-2xl tracking-tighter">Sentinel</span>
                </div>
            </header>

            <main className="flex-grow flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-xl">
                    {!verifiedUser ? (
                        <div className="glass-panel rounded-[40px] shadow-[0_32px_64px_rgba(78,0,13,0.15)] overflow-hidden">
                            {/* Card Header */}
                            <div className="relative h-48 flex flex-col justify-end p-8 overflow-hidden">
                                <img className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAUZvmMDuMZikePN7m8b2REfIL4WtKGffYugs6rv0b-lzelliv0fSGAxDbl5V0l1sFWZneagtmJ9d5xCs1OIEpGoOtS9Auvx1GYBmpaG5RpKElABVGoggtfbZaN-vy1tBYnjQn_-YdgzXbOcSwwsbauejiGq2sT349R_0PAqybz_-3NKtjL1vTQOn7a0cu4nVX30vUDME3zo1JqCZXCnCB3uuZWKyMu1ZiVl2Qj1PdILWwEe21FVSzTNPvDNDVRaZDHoJm29UNC2w" />
                                <div className="absolute inset-0 bg-gradient-to-t from-surface-container-high via-surface-container-high/60 to-transparent"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="px-3 py-1 rounded-full bg-tertiary-container/10 border border-tertiary-container/20 text-tertiary text-[10px] font-bold uppercase tracking-widest">Partner Portal</span>
                                    </div>
                                    <h1 className="font-epilogue text-3xl font-extrabold tracking-tight text-on-surface leading-tight">
                                        Register to Sentinel using the Zomato's Rider Credential
                                    </h1>
                                </div>
                            </div>

                            {/* Registration Form */}
                            <div className="p-8 space-y-8">
                                {error && (
                                    <div className="p-4 bg-error-container/20 border border-error-container/40 rounded-2xl text-error text-xs font-bold text-center">
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleVerify} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">Email</label>
                                            <div className="relative group">
                                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">mail</span>
                                                <input
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    required
                                                    style={{ backgroundColor: '#1A1C1E' }}
                                                    className="w-full pl-12 pr-4 py-4 bg-surface-container-highest rounded-2xl border-none ring-1 ring-outline-variant/15 focus:ring-2 focus:ring-primary outline-none transition-all duration-300 text-on-surface placeholder:text-on-surface-variant/40 font-medium"
                                                    placeholder="Enter email used in Zomato"
                                                    type="email"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">Mobile No.</label>
                                            <div className="relative group">
                                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">smartphone</span>
                                                <input
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value)}
                                                    required
                                                    style={{ backgroundColor: '#1A1C1E' }}
                                                    className="w-full pl-12 pr-4 py-4 bg-surface-container-highest rounded-2xl border-none ring-1 ring-outline-variant/15 focus:ring-2 focus:ring-primary outline-none transition-all duration-300 text-on-surface placeholder:text-on-surface-variant/40 font-medium"
                                                    placeholder="98765 43210"
                                                    type="tel"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">Password</label>
                                            <div className="relative group">
                                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">lock</span>
                                                <input
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    required
                                                    style={{ backgroundColor: '#1A1C1E' }}
                                                    className="w-full pl-12 pr-4 py-4 bg-surface-container-highest rounded-2xl border-none ring-1 ring-outline-variant/15 focus:ring-2 focus:ring-primary outline-none transition-all duration-300 text-on-surface placeholder:text-on-surface-variant/40 font-medium"
                                                    placeholder="••••••••"
                                                    type="password"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1">Confirm Password</label>
                                            <div className="relative group">
                                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">security</span>
                                                <input
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    required
                                                    style={{ backgroundColor: '#1A1C1E' }}
                                                    className="w-full pl-12 pr-4 py-4 bg-surface-container-highest rounded-2xl border-none ring-1 ring-outline-variant/15 focus:ring-2 focus:ring-primary outline-none transition-all duration-300 text-on-surface placeholder:text-on-surface-variant/40 font-medium"
                                                    placeholder="••••••••"
                                                    type="password"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 rounded-3xl bg-surface-container-high border border-outline-variant/10 flex items-center gap-6">
                                        <div className="relative flex-shrink-0 w-16 h-16">
                                            <svg className="w-full h-full -rotate-90">
                                                <circle className="text-surface-variant" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeWidth="6"></circle>
                                                <circle className="text-secondary" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeDasharray="175" strokeDashoffset="40" strokeWidth="6"></circle>
                                            </svg>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-on-surface text-sm">Security Level: High</h4>
                                            <p className="text-on-surface-variant text-xs mt-1 leading-relaxed">Your Zomato credentials are encrypted and verified through a secure API bridge. We never store your raw login data.</p>
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full group relative overflow-hidden bg-gradient-to-br from-rose-500 to-pink-700 py-5 rounded-2xl text-white font-bold text-lg shadow-lg shadow-rose-900/40 active:scale-[0.98] transition-all duration-300"
                                        >
                                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            <span className="relative z-10 flex items-center justify-center gap-3">
                                                {loading ? "Verifying..." : "Register"}
                                                <span className="material-symbols-outlined text-xl">arrow_forward</span>
                                            </span>
                                        </button>
                                        <div className="mt-8 text-center">
                                            <p className="text-on-surface-variant text-sm">
                                                Already protected by Sentinel?
                                                <br></br>
                                                <Link className="text-secondary font-bold hover:text-primary transition-colors ml-1" href="/sentinel/rider/login">Log in here</Link>
                                            </p>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    ) : (
                        <div className="glass-panel rounded-[40px] shadow-[0_32px_64px_rgba(78,0,13,0.15)] p-10 text-center">
                            <div className="w-20 h-20 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-rose-500/30">
                                <span className="material-symbols-outlined text-rose-400 text-4xl">verified</span>
                            </div>
                            <h2 className="font-headline text-3xl font-black mb-2">Credential Verified</h2>
                            <p className="text-on-surface-variant text-sm mb-10 tracking-widest uppercase font-bold">Zomato Rider identified</p>

                            <div className="bg-surface-container-highest/50 rounded-3xl p-8 mb-10 text-left border border-white/5 space-y-6">
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Rider Name</label>
                                    <p className="text-xl font-bold text-white uppercase mt-1">{verifiedUser.name}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Onboarded</label>
                                        <p className="text-sm font-bold text-tertiary mt-1">{new Date(verifiedUser.joined_at).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Profile ID</label>
                                        <p className="text-sm font-bold text-tertiary mt-1">{verifiedUser.id.substring(0, 8)}...</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleConfirmRegistration}
                                className="w-full bg-gradient-to-br from-rose-500 to-pink-700 py-6 rounded-2xl text-white font-bold text-xl shadow-xl shadow-rose-900/40 active:scale-[0.98] transition-all"
                            >
                                Confirm & Access Shield
                            </button>
                            <button
                                onClick={() => setVerifiedUser(null)}
                                className="mt-6 text-on-surface-variant text-[10px] font-bold uppercase tracking-[0.2em] hover:text-rose-400 transition-colors"
                            >
                                Not your profile? Re-verify
                            </button>
                        </div>
                    )}

                    {/* Trust Badges */}
                    <div className="mt-12 flex justify-center items-center gap-10 opacity-60">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-xl">gpp_good</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest">256-bit AES</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-xl">health_and_safety</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest">Rider Verified</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-xl">lock_open</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest">No Hidden Fees</span>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="py-10 text-center">
                <p className="text-[10px] text-on-surface-variant font-medium tracking-widest uppercase opacity-40">
                    © 2024 Sentinel Technologies. All Rights Reserved.
                </p>
            </footer>
        </>
    );
}
