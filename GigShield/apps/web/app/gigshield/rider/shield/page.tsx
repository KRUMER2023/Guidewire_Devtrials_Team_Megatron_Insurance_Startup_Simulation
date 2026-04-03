"use client";

import React from 'react';

export default function ShieldPage() {
    return (
        <main>
            {/* Protection Features (Bento Grid) - STRICT HTML */}
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
                    {/* Natural Disruption */}
                    <div className="md:col-span-8 bg-surface-container-high rounded-[32px] p-8 relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-6">
                                <span className="material-symbols-outlined text-primary text-4xl" data-icon="tsunami">tsunami</span>
                            </div>
                            <h3 className="font-headline text-3xl font-bold mb-4">Natural Elements</h3>
                            <p className="text-on-surface-variant text-lg max-w-md mb-8">Waterlogging, Floods, and Heavy Rain can paralyze the city. We cover the gap when the roads become impassable.</p>
                            <div className="flex gap-4">
                                <span className="px-4 py-2 bg-surface-container-highest rounded-full text-sm font-bold text-tertiary">#Waterlogging</span>
                                <span className="px-4 py-2 bg-surface-container-highest rounded-full text-sm font-bold text-tertiary">#Floods</span>
                            </div>
                        </div>
                        <img alt="" className="absolute right-0 top-0 h-full w-1/3 object-cover opacity-20 group-hover:opacity-40 transition-opacity" data-alt="Macro shot of raindrops on a glass surface with blurred city lights in a deep blue and red tone" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPVrOk-x8eTlXsiODeFilMPBz881neLFUe1oLDRQ11Y1ewGeuPabsWF_HSlwQSP65G15I86onI2gaBetZ2VQxKjW-pq08NlfFTWuC5WqCis2_J-zzsCSP4nS5fZm89hcW13GjbqVV2NCYlv15UBmR0A2DoR0vodo4ciGlKz9R-p-9-ZeD7Y1zA9fddPTrehcixNA7Jzxcx-QRtWKOwsdyYRRfVScI_wn2W0sSdZ-7RHbDXZHT9Qf2xKgD3yduy7m3JEdjOzlOTUbE" />
                    </div>
                    {/* City Pulse */}
                    <div className="md:col-span-4 bg-surface-container-high rounded-[32px] p-8 border border-outline-variant/10">
                        <div className="w-16 h-16 bg-secondary/20 rounded-2xl flex items-center justify-center mb-6">
                            <span className="material-symbols-outlined text-secondary text-4xl" data-icon="traffic">traffic</span>
                        </div>
                        <h3 className="font-headline text-3xl font-bold mb-4">City Pulse</h3>
                        <p className="text-on-surface-variant text-lg">Heavy Traffic, VIP Movements, and Roadblocks are no longer your financial burden.</p>
                    </div>
                    {/* Social/Global */}
                    <div className="md:col-span-4 bg-surface-container-low rounded-[32px] p-8 border border-outline-variant/10">
                        <div className="w-16 h-16 bg-error/20 rounded-2xl flex items-center justify-center mb-6">
                            <span className="material-symbols-outlined text-error text-4xl" data-icon="policy">policy</span>
                        </div>
                        <h3 className="font-headline text-3xl font-bold mb-4">Social Unrest</h3>
                        <p className="text-on-surface-variant text-lg">Stay safe during Protests, Lockdowns, or Curfews while your earnings remain secured.</p>
                    </div>
                    {/* The Protection Gauge (Custom Component) */}
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
        </main>
    );
}
