"use client";

import React from 'react';
import { useSimulation, HARDCODED_PATH } from '../../context/SimulationContext';
import { MapPin, User, Package, CheckCircle } from 'lucide-react';

export default function TrackingProgress() {
    const { state } = useSimulation();

    if (!state.activeTracking) return null;

    const totalSteps = HARDCODED_PATH.length; // 16 steps total
    const currentStep = state.trackingIndex;

    // Segmented Progress Logic (A -> B -> C)
    // A (Spawn): Index 0
    // B (Pickup): Index 5
    // C (Delivery): Index 15
    let progress = 0;
    if (currentStep <= 5) {
        // First half: Spawn to Pickup (0 to 50%)
        progress = (currentStep / 5) * 50;
    } else {
        // Second half: Pickup to Delivery (50 to 100%)
        // Remaining steps: currentStep - 5 (from 1 to 10)
        // Total remaining: 15 - 5 = 10
        progress = 50 + ((currentStep - 5) / 10) * 50;
    }

    // Node statuses
    const isAtPickupOrBeyond = currentStep >= 5;
    const isAtDelivery = currentStep === 15;

    return (
        <div className="bg-[#111827] border-b border-[#31353f] px-6 py-2 flex flex-col space-y-2 shrink-0">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></div>
                    <span className="text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-widest">Live Order Tracking</span>
                </div>
                <span className="text-[9px] font-mono text-[#505868]">STEP: {currentStep + 1} / {totalSteps}</span>
            </div>

            <div className="relative h-1 bg-[#0a0e17] rounded-full overflow-hidden border border-[#31353f]">
                <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-400 transition-all duration-700 ease-in-out"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>

            <div className="flex justify-between items-start px-1">
                {/* Rider Origination */}
                <div className="flex flex-col items-center gap-1 w-20">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${currentStep < 5 ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400' : 'bg-indigo-500 border-indigo-400 text-white'}`}>
                        <User className="w-3 h-3" />
                    </div>
                    <span className={`text-[8px] font-mono text-center uppercase tracking-tighter ${currentStep < 5 ? 'text-indigo-400 font-bold' : 'text-[#505868]'}`}>Rider Loc</span>
                </div>

                {/* Pickup Point */}
                <div className="flex flex-col items-center gap-1 w-20">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${currentStep === 5 ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 animate-pulse' : isAtPickupOrBeyond ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-[#0a0e17] border-[#31353f] text-[#31353f]'}`}>
                        <Package className="w-3 h-3" />
                    </div>
                    <span className={`text-[8px] font-mono text-center uppercase tracking-tighter ${currentStep === 5 ? 'text-emerald-400 font-bold' : isAtPickupOrBeyond ? 'text-[#908fa0]' : 'text-[#31353f]'}`}>Pickup</span>
                </div>

                {/* Delivered */}
                <div className="flex flex-col items-center gap-1 w-20">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${isAtDelivery ? 'bg-indigo-500 border-indigo-400 text-white' : 'bg-[#0a0e17] border-[#31353f] text-[#31353f]'}`}>
                        <CheckCircle className="w-3 h-3" />
                    </div>
                    <span className={`text-[8px] font-mono text-center uppercase tracking-tighter ${isAtDelivery ? 'text-indigo-400 font-bold' : 'text-[#31353f]'}`}>Delivered</span>
                </div>
            </div>
        </div>
    );
}
