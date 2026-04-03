"use client";

import React from 'react';

export default function EarningsPage() {
    return (
        <main>
            {/* How It Works Section - STRICT HTML */}
            <section className="py-24 bg-surface-container-low relative overflow-hidden" id="how-it-works">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="space-y-12">
                        <div className="flex gap-6">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full crimson-velocity flex items-center justify-center font-black text-xl text-white">1</div>
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
        </main>
    );
}
