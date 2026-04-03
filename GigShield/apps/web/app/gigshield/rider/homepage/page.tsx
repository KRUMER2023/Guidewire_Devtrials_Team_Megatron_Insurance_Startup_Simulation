"use client";

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function RiderHomepage() {
    const { user } = useAuth();
    const userId = user?.id;

    return (
        <>
            <style jsx global>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .crimson-velocity {
          background: linear-gradient(135deg, #ff8d8f 0%, #bc004f 100%);
        }
        .glass-panel {
          backdrop-filter: blur(20px);
          background: rgba(35, 38, 41, 0.4);
        }
      `}</style>

            {/* Hero Section */}
            <section className="relative min-h-[795px] flex items-center justify-center px-6 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-surface/20 via-surface to-surface z-10"></div>
                    <img alt="" className="w-full h-full object-cover opacity-40" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBRv302SnQcte2oC8iFybYcGeDXDBwF6kLNs-AUpjbR1nO3ndLYfg_5vOuAsu1J7rDA5ir8lnD_wqCvxOEL9zCG3iF5bv-t-Bd7yUW1WOInm1hJjh0xUOSpLR8VsNsdctDUpcb1JkBfwBykAvcA837d_qQjAacNHINvjRMzvJlyoHMWI9PmFiqmyGAmeXs5XVwkMSXuGnLPyHWHx3_hzFECtReTTdfHgXX52AD0ao0xdIgQk6jFt5ocLRoVST0f4h4DetxbbZG_Tow" />
                </div>
                <div className="relative z-20 max-w-5xl mx-auto text-center">
                    <h1 className="font-headline text-5xl md:text-8xl font-black tracking-tighter mb-6 leading-tight">
                        Shield Your Earnings <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-tertiary">Against the Unexpected.</span>
                    </h1>
                    <p className="font-body text-lg md:text-2xl text-on-surface-variant max-w-3xl mx-auto mb-10 leading-relaxed">
                        Get paid for lost hours due to waterlogging, floods, heavy traffic, protests, curfews, and more. Our smart system predicts next week's risks for affordable, dynamic weekly pricing.
                    </p>
                    <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                        <Link href="/gigshield/rider/register">
                            <button className="crimson-velocity text-white px-10 py-5 rounded-xl font-bold text-xl shadow-lg shadow-rose-900/20 active:scale-95 transition-transform">
                                Register Now
                            </button>
                        </Link>
                        <Link href="/gigshield/rider/login">
                            <button className="bg-surface-variant/20 border border-primary/20 backdrop-blur-md text-primary px-10 py-5 rounded-xl font-bold text-xl hover:bg-surface-variant/40 transition-colors">
                                Login to Account
                            </button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Protection Features (Bento Grid) */}
            <section className="py-24 px-6 max-w-7xl mx-auto" id="features">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
                    <div>
                        <h2 className="font-headline text-4xl md:text-6xl font-bold mb-4">Total Coverage</h2>
                        <p className="text-on-surface-variant text-xl">We monitor 24/7 to ensure your wallet stays protected.</p>
                    </div>
                    <div className="flex gap-2">
                        <span className="h-3 w-12 bg-primary rounded-full"></span>
                        <span className="h-3 w-3 bg-surface-container-highest rounded-full"></span>
                        <span className="h-3 w-3 bg-surface-container-highest rounded-full"></span>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div className="md:col-span-8 bg-surface-container-high rounded-[32px] p-8 relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-6">
                                <span className="material-symbols-outlined text-primary text-4xl">tsunami</span>
                            </div>
                            <h3 className="font-headline text-3xl font-bold mb-4">Natural Elements</h3>
                            <p className="text-on-surface-variant text-lg max-w-md mb-8">Waterlogging, Floods, and Heavy Rain can paralyze the city. We cover the gap when the roads become impassable.</p>
                            <div className="flex gap-4">
                                <span className="px-4 py-2 bg-surface-container-highest rounded-full text-sm font-bold text-tertiary">#Waterlogging</span>
                                <span className="px-4 py-2 bg-surface-container-highest rounded-full text-sm font-bold text-tertiary">#Floods</span>
                            </div>
                        </div>
                        <img alt="" className="absolute right-0 top-0 h-full w-1/3 object-cover opacity-20 group-hover:opacity-40 transition-opacity" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPVrOk-x8eTlXsiODeFilMPBz881neLFUe1oLDRQ11Y1ewGeuPabsWF_HSlwQSP65G15I86onI2gaBetZ2VQxKjW-pq08NlfFTWuC5WqCis2_J-zzsCSP4nS5fZm89hcW13GjbqVV2NCYlv15UBmR0A2DoR0vodo4ciGlKz9R-p-9-ZeD7Y1zA9fddPTrehcixNA7Jzxcx-QRtWKOwsdyYRRfVScI_wn2W0sSdZ-7RHbDXZHT9Qf2xKgD3yduy7m3JEdjOzlOTUbE" />
                    </div>
                    <div className="md:col-span-4 bg-surface-container-high rounded-[32px] p-8 border border-outline-variant/10">
                        <div className="w-16 h-16 bg-secondary/20 rounded-2xl flex items-center justify-center mb-6">
                            <span className="material-symbols-outlined text-secondary text-4xl">traffic</span>
                        </div>
                        <h3 className="font-headline text-3xl font-bold mb-4">City Pulse</h3>
                        <p className="text-on-surface-variant text-lg">Heavy Traffic, VIP Movements, and Roadblocks are no longer your financial burden.</p>
                    </div>
                    <div className="md:col-span-4 bg-surface-container-low rounded-[32px] p-8 border border-outline-variant/10">
                        <div className="w-16 h-16 bg-error/20 rounded-2xl flex items-center justify-center mb-6">
                            <span className="material-symbols-outlined text-error text-4xl">policy</span>
                        </div>
                        <h3 className="font-headline text-3xl font-bold mb-4">Social Unrest</h3>
                        <p className="text-on-surface-variant text-lg">Stay safe during Protests, Lockdowns, or Curfews while your earnings remain secured.</p>
                    </div>
                    <div className="md:col-span-8 bg-surface-container-highest rounded-[32px] p-8 flex flex-col md:flex-row items-center gap-8 border border-tertiary/5">
                        <div className="relative w-48 h-48 flex-shrink-0">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle className="text-surface-container-low" cx="96" cy="96" fill="transparent" r="80" stroke="currentColor" strokeWidth="12"></circle>
                                <circle cx="96" cy="96" fill="transparent" r="80" stroke="url(#gaugeGradient)" strokeDasharray="502" strokeDashoffset="120" strokeLinecap="round" strokeWidth="12"></circle>
                                <defs>
                                    <linearGradient id="gaugeGradient" x1="0%" x2="100%" y1="0%">
                                        <stop offset="0%" style={{ stopColor: '#ff6c91' }}></stop>
                                        <stop offset="100%" style={{ stopColor: '#fffadf' }}></stop>
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="font-headline text-4xl font-black">94%</span>
                                <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Safety Index</span>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-headline text-3xl font-bold mb-2">Weekly Protection Rating</h3>
                            <p className="text-on-surface-variant text-lg leading-relaxed">Our AI analyzes over 200 data points including weather patterns, political schedules, and traffic trends to provide your weekly shield rating.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-24 bg-surface-container-low relative overflow-hidden" id="how-it-works">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="space-y-12">
                        <div className="flex gap-6">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full crimson-velocity flex items-center justify-center font-black text-xl">1</div>
                            <div>
                                <h4 className="font-headline text-2xl font-bold mb-2">AI Predictions</h4>
                                <p className="text-on-surface-variant text-lg">Every Sunday, our system calculates the risk score for your specific city zone for the upcoming week.</p>
                            </div>
                        </div>
                        <div className="flex gap-6">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center font-black text-xl text-primary border border-primary/30">2</div>
                            <div>
                                <h4 className="font-headline text-2xl font-bold mb-2">Dynamic Pricing</h4>
                                <p className="text-on-surface-variant text-lg">You pay a small, transparent fee based on that risk. Higher risk weeks are prioritized for deep coverage.</p>
                            </div>
                        </div>
                        <div className="flex gap-6">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center font-black text-xl text-secondary border border-secondary/30">3</div>
                            <div>
                                <h4 className="font-headline text-2xl font-bold mb-2">Instant Payouts</h4>
                                <p className="text-on-surface-variant text-lg">If disruptions occur and you lose working hours, the system triggers an automatic payout directly to your bank account.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Partners Section */}
            <section className="py-20 px-6 max-w-7xl mx-auto text-center border-t border-outline-variant/10">
                <h2 className="font-headline text-2xl text-on-surface-variant font-bold mb-12">Trusted by the Leaders of the Gig Economy</h2>
                <div className="flex flex-wrap justify-center items-center gap-12 opacity-80 hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-4 bg-white/5 px-8 py-4 rounded-2xl backdrop-blur-sm">
                        <span className="font-epilogue font-black text-rose-500 text-3xl italic tracking-tighter">zomato</span>
                        <span className="h-6 w-px bg-stone-700"></span>
                        <span className="text-stone-500 font-bold text-sm tracking-widest uppercase">Official Partner</span>
                    </div>
                </div>
            </section>
        </>
    );
}
