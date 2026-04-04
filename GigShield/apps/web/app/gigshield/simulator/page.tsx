"use client";

import React from 'react';
import { SimulationProvider, useSimulation } from '../../../context/SimulationContext';
import PersonaSidebar from '../../../components/simulator/PersonaSidebar';
import SpatialMapClient from '../../../components/simulator/SpatialMapClient';
import EventTracker from '../../../components/simulator/EventTracker';
import { Shield } from 'lucide-react';
import MapSearchBar from '../../../components/simulator/MapSearchBar';
import HexSearchBar from '../../../components/simulator/HexSearchBar';
import OrderAssigner from '../../../components/simulator/OrderAssigner';
import ServerLog from '../../../components/simulator/ServerLog';
import TrackingProgress from '../../../components/simulator/TrackingProgress';

function GodModeControlRoom() {
    const { state } = useSimulation();
    return (
        <div className="h-screen w-screen bg-[#0a0e17] text-white flex flex-col font-sans overflow-hidden">
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
            <main className="flex-1 grid grid-cols-[280px_1fr_320px] grid-rows-[400px_1fr] gap-0 overflow-hidden">

                {/* Left Sidebar (spans both rows) */}
                <div className="row-span-2 overflow-hidden border-r border-[#31353f]">
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
                    <div className="h-1/2 overflow-hidden">
                        <OrderAssigner />
                    </div>
                    <div className="h-1/2 overflow-hidden border-t border-[#31353f]">
                        <EventTracker />
                    </div>
                </div>

                {/* Bottom Bar: dynamic layout based on tracking */}
                <div className="col-start-2 row-start-2 flex flex-col border-t border-[#31353f] overflow-hidden">
                    <TrackingProgress />
                    <div className="flex-1 overflow-hidden">
                        <ServerLog />
                    </div>
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
