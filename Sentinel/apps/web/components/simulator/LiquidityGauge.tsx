"use client";

import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { Wallet, TrendingDown } from 'lucide-react';

export default function LiquidityGauge() {
    const { state } = useSimulation();

    // Fake calculation based on active events
    const drainRate = state.events.length * 450;

    return (
        <div className="h-full p-4 bg-[#111827] border-l border-t border-[#31353f] flex flex-col justify-center">
            <div className="flex items-center space-x-2 mb-4">
                <Wallet className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-semibold text-[#dfe2ef]">Liquidity Pool</h2>
            </div>

            <div className="text-3xl font-display font-bold text-white mb-2">
                ₹{state.fundBalance.toLocaleString('en-IN')}
            </div>

            <div className="flex items-center space-x-2 text-xs">
                {drainRate > 0 ? (
                    <>
                        <TrendingDown className="w-3 h-3 text-red-400" />
                        <span className="text-red-400 font-mono">-₹{drainRate}/sec drain</span>
                    </>
                ) : (
                    <span className="text-[#908fa0] font-mono">Stable</span>
                )}
            </div>

            <div className="mt-4 w-full bg-[#1f2937] h-2 rounded-full overflow-hidden">
                <div
                    className={`h-full transition-all duration-1000 ${drainRate > 0 ? 'bg-orange-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.max(10, Math.min(100, (state.fundBalance / 20000000) * 100))}%` }}
                ></div>
            </div>
        </div>
    );
}
