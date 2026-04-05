"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AccountPage() {
    const { user, stats, recentLogs, isLoading, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/sentinel/rider/login');
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading || !user) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-surface">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-stone-400 animate-pulse">Accessing Secure Vault...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="py-12 px-6 max-w-7xl mx-auto space-y-12 pb-32">
            <header>
                <h2 className="font-headline text-5xl font-black mb-2">Rider Account</h2>
                <p className="text-stone-400 font-bold text-[10px] uppercase tracking-[0.2em]">Protocol: {user.name.toUpperCase()}</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Protection Index */}
                <div className="md:col-span-8 bg-surface-container-highest rounded-[48px] p-10 flex flex-col md:flex-row items-center gap-10 border border-white/5">
                    <div className="relative w-48 h-48 flex-shrink-0">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle className="text-surface-container-low" cx="96" cy="96" fill="transparent" r="80" stroke="currentColor" strokeWidth="12"></circle>
                            <circle cx="96" cy="96" fill="transparent" r="80" stroke="url(#gaugeGradient)" strokeDasharray="502" strokeDashoffset={502 - (502 * (stats?.trust_score || 0)) / 100} strokeLinecap="round" strokeWidth="12" className="transition-all duration-1000"></circle>
                            <defs>
                                <linearGradient id="gaugeGradient" x1="0%" x2="100%" y1="0%">
                                    <stop offset="0%" style={{ stopColor: '#ff6c91' }}></stop>
                                    <stop offset="100%" style={{ stopColor: '#fffadf' }}></stop>
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="font-headline text-5xl font-black text-rose-500">{stats?.trust_score || 0}</span>
                            <span className="text-[10px] uppercase tracking-widest text-stone-500 font-black">Trust Score</span>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-headline text-3xl font-bold mb-4">Loyalty Status: {(stats?.trust_score || 0) > 90 ? 'Platinum' : 'Gold'}</h3>
                        <p className="text-on-surface-variant text-lg leading-relaxed">Your high trust score entitles you to a <span className="text-rose-400 font-bold">15% discount</span> on all dynamic weekly premiums.</p>
                    </div>
                </div>

                {/* Stats Summary */}
                <div className="md:col-span-4 bg-surface-container-high rounded-[48px] p-10 border border-outline-variant/10 flex flex-col justify-center">
                    <div className="mb-8 font-headline">
                        <p className="text-[10px] text-stone-500 uppercase font-black mb-2 tracking-widest">Total Payouts</p>
                        <p className="text-5xl font-black text-rose-400">₹{stats?.total_payouts || 0}</p>
                    </div>
                    <div className="font-headline">
                        <p className="text-[10px] text-stone-500 uppercase font-black mb-2 tracking-widest">Weekly Premium</p>
                        <p className="text-3xl font-black text-white">₹{stats?.current_premium || 0}</p>
                    </div>
                </div>

                {/* Payout Logs - STRICT PWA STYLE */}
                <div className="md:col-span-12 bg-surface-container-low rounded-[48px] p-10 border border-outline-variant/10">
                    <h3 className="font-headline text-2xl font-bold mb-10">Vault Transaction History</h3>
                    <div className="space-y-6">
                        {recentLogs.length > 0 ? recentLogs.map((log, idx) => (
                            <div key={idx} className="flex items-center justify-between p-6 bg-surface-container-highest/40 rounded-3xl border border-white/5">
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center">
                                        <span className="material-symbols-outlined text-rose-400">payments</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg uppercase tracking-tight">{log.event_type.replace(/_/g, ' ')}</h4>
                                        <p className="text-[10px] text-stone-500 font-mono tracking-widest">{new Date(log.timestamp).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="text-2xl font-black text-rose-400">+₹{log.amount}</div>
                            </div>
                        )) : (
                            <p className="text-center text-stone-600 font-bold py-10 uppercase tracking-[0.3em]">No Payouts in History</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
