"use client";

import React, { useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { AlertTriangle, CloudLightning, ShieldOff, Play } from 'lucide-react';
import * as h3 from 'h3-js';

// Hardcoded sample coordinates for demo purposes
const SAMPLE_LOCATIONS: Record<string, [number, number]> = {
    DELHI_CENTER: [28.6139, 77.2090],
    NOIDA: [28.5355, 77.3910],
    GURUGRAM: [28.4595, 77.0266],
};

export default function GodPanel() {
    const { dispatch } = useSimulation();
    const [loading, setLoading] = useState(false);

    const triggerDisaster = async (type: string, intensity: 'RED' | 'ORANGE', locationKey: string) => {
        setLoading(true);

        const location = SAMPLE_LOCATIONS[locationKey];
        // Get center hex at resolution 10 (smaller, ~150m wide hexagons)
        const centerHex = h3.latLngToCell(location[0], location[1], 10);
        // Tighter radius to match smaller hex scale
        const radius = intensity === 'RED' ? 4 : 7;
        const hexIds = h3.gridDisk(centerHex, radius);

        dispatch({
            type: 'TRIGGER_DISASTER',
            payload: { hexIds, intensity, location }
        });
        setLoading(false);
    };

    const clearAll = () => {
        dispatch({ type: 'CLEAR_DISASTER' });
    };

    return (
        <div className="h-full flex flex-col p-4 bg-[#0a0e17] border-l border-[#31353f] border-t">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-[#908fa0] uppercase tracking-wider">Trigger Room</h2>
                <button onClick={clearAll} className="text-xs text-red-400 hover:text-red-300 transition-colors">Clear All</button>
            </div>

            <div className="space-y-4 overflow-y-auto custom-scrollbar flex-1 pr-1">

                {/* Scenario 1: Accident */}
                <div className="glass-card p-4 rounded-xl">
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                            <div className="p-1.5 bg-orange-500/20 rounded-lg text-orange-400">
                                <AlertTriangle className="w-4 h-4" />
                            </div>
                            <h3 className="font-medium text-gray-200 text-sm">Traffic Accident</h3>
                        </div>
                        <span className="text-[10px] font-mono bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded-full border border-orange-500/20">ORANGE</span>
                    </div>
                    <p className="text-xs text-[#908fa0] mb-3">Triggers a moderate hazard zone in Central Delhi.</p>
                    <button
                        disabled={loading}
                        onClick={() => triggerDisaster('Accident', 'ORANGE', 'DELHI_CENTER')}
                        className="w-full flex items-center justify-center space-x-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 py-2 rounded-lg text-xs font-semibold transition-colors border border-orange-500/30"
                    >
                        <Play className="w-3 h-3" fill="currentColor" />
                        <span>Deploy Incident</span>
                    </button>
                </div>

                {/* Scenario 2: Cyclone/Storm */}
                <div className="glass-card p-4 rounded-xl">
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                            <div className="p-1.5 bg-red-500/20 rounded-lg text-red-400">
                                <CloudLightning className="w-4 h-4" />
                            </div>
                            <h3 className="font-medium text-gray-200 text-sm">Severe Storm</h3>
                        </div>
                        <span className="text-[10px] font-mono bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full border border-red-500/20">RED</span>
                    </div>
                    <p className="text-xs text-[#908fa0] mb-3">Triggers a widespread critical hazard zone over Gurugram.</p>
                    <button
                        disabled={loading}
                        onClick={() => triggerDisaster('Storm', 'RED', 'GURUGRAM')}
                        className="w-full flex items-center justify-center space-x-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 py-2 rounded-lg text-xs font-semibold transition-colors border border-red-500/30 glow-red"
                    >
                        <Play className="w-3 h-3" fill="currentColor" />
                        <span>Deploy Incident</span>
                    </button>
                </div>

            </div>
        </div>
    );
}
