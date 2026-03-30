"use client";

import React from 'react';
import { SimulationProvider } from '../../../context/SimulationContext';
import PersonaSidebar from '../../../components/simulator/PersonaSidebar';
import SpatialMapClient from '../../../components/simulator/SpatialMapClient';
import EventTracker from '../../../components/simulator/EventTracker';
import GodPanel from '../../../components/simulator/GodPanel';
import ServerLog from '../../../components/simulator/ServerLog';
import LiquidityGauge from '../../../components/simulator/LiquidityGauge';
import TimeWarp from '../../../components/simulator/TimeWarp';
import { Shield } from 'lucide-react';
import MapSearchBar from '../../../components/simulator/MapSearchBar';
import HexSearchBar from '../../../components/simulator/HexSearchBar';

function GodModeControlRoom() {
    return (
        <div className="h-screen w-screen bg-[#0a0e17] text-white overflow-hidden flex flex-col font-sans">

            {/* Header (Navbar) */}
            <header className="h-14 border-b border-[#31353f] bg-[#111827] flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center space-x-3">
                    <div className="p-1.5 bg-indigo-500/20 rounded-lg">
                        <Shield className="w-5 h-5 text-indigo-400" />
                    </div>
                    <h1 className="font-display font-bold tracking-widest text-lg">GIGSHIELD</h1>
                    <div className="ml-4 px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-green-400 text-[10px] font-mono font-semibold uppercase">System Online</span>
                    </div>
                </div>
            </header>

            {/* Main Simulation Grid */}
            <main className="flex-1 grid grid-cols-[280px_1fr_320px] grid-rows-[minmax(0,1fr)_200px] gap-0 overflow-hidden">

                {/* Left Sidebar (spans both rows) */}
                <div className="row-span-2 overflow-hidden">
                    <PersonaSidebar />
                </div>

                {/* Center Map (top row) */}
                <div className="relative overflow-hidden border-r border-[#31353f] shadow-[inset_0_0_50px_rgba(0,0,0,0.8)]">
                    <SpatialMapClient />

                    {/* Map Overlay Stats + Search (top-left row) */}
                    <div className="absolute top-4 left-4 z-20 flex items-center space-x-2">
                        <div className="bg-[#111827]/80 backdrop-blur-md border border-[#31353f] px-3 py-1.5 rounded text-xs font-mono font-semibold text-white pointer-events-none">
                            RES: H3 (10)
                        </div>
                        <div className="bg-[#111827]/80 backdrop-blur-md border border-[#31353f] px-3 py-1.5 rounded text-xs font-mono font-semibold text-indigo-300 pointer-events-none">
                            PROJ: VECTOR
                        </div>
                        <MapSearchBar />
                        <HexSearchBar />
                    </div>
                </div>

                {/* Right Sidebar (spans both rows) */}
                <div className="row-span-2 flex flex-col overflow-hidden bg-[#0a0e17]">
                    <div className="h-[40%] overflow-hidden">
                        <EventTracker />
                    </div>
                    <div className="h-[60%] border-t border-[#31353f] overflow-hidden">
                        <GodPanel />
                    </div>
                </div>

                {/* Bottom Bar: fixed 200px row, hard-clipped */}
                <div className="col-start-2 row-start-2 grid grid-cols-[1fr] border-t border-[#31353f] overflow-hidden h-[200px]">
                    <div className="overflow-hidden h-full"><ServerLog /></div>
                    <div className="hidden"><LiquidityGauge /></div>
                    <div className="hidden"><TimeWarp /></div>
                </div>
            </main>

        </div>
    );
}

export default function SimulatorPage() {
    return (
        <SimulationProvider>
            <GodModeControlRoom />
        </SimulationProvider>
    );
}
