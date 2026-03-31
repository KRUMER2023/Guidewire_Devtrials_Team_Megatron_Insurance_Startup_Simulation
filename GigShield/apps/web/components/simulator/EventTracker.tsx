"use client";

import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { Activity, ShieldAlert, MapPin, Layers } from 'lucide-react';
import * as h3 from 'h3-js';

export default function EventTracker() {
    const { state, dispatch } = useSimulation();

    // Only show DB-backed hazards where is_active == true
    const activeHazards = state.dbHazards.filter(h => h.is_active);

    const snapToHazard = (hexes: string[]) => {
        if (!hexes || hexes.length === 0) return;
        try {
            // Snap to the first hex in the list
            const [lat, lng] = h3.cellToLatLng(hexes[0]);
            dispatch({ type: 'FOCUS_LOCATION', payload: { location: [lat, lng] } });
        } catch { /* ignore invalid hex */ }
    };

    return (
        <div className="h-full flex flex-col p-4 bg-[#111827] border-l border-[#31353f] border-b">
            <div className="flex items-center space-x-2 mb-4 shrink-0">
                <Activity className="w-4 h-4 text-indigo-400" />
                <h2 className="text-sm font-semibold text-[#dfe2ef] tracking-wide">Event Tracker</h2>
                {activeHazards.length > 0 && (
                    <span className="ml-auto text-[10px] font-mono bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full border border-red-500/20">
                        {activeHazards.length} Active
                    </span>
                )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 custom-scrollbar pr-1 min-h-0">
                {activeHazards.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-[#908fa0] space-y-2 opacity-50">
                        <ShieldAlert className="w-8 h-8" />
                        <span className="text-xs">No active hazard events</span>
                    </div>
                ) : (
                    activeHazards.map(hazard => (
                        <div
                            key={hazard.id}
                            className="p-3 rounded-lg border bg-red-500/10 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.05)]"
                        >
                            <div className="flex items-start justify-between">
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <p className="font-semibold text-red-400 text-xs truncate">
                                            {hazard.hazard_type.replace(/_/g, ' ')}
                                        </p>
                                        <div className="flex items-center gap-0.5 px-1 py-0.5 bg-red-500/20 rounded text-[9px] text-red-300 border border-red-500/30">
                                            <Layers className="w-2.5 h-2.5" />
                                            {hazard.hex_index.length}
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-indigo-300 font-mono truncate opacity-60">
                                        ⬡ {hazard.hex_index.join(', ').slice(0, 30)}...
                                    </p>
                                    <p className="text-[10px] text-[#908fa0] mt-1">
                                        Severity: <span className="text-orange-400">{hazard.severity}/10</span>
                                        &nbsp;·&nbsp;Confidence: {hazard.confidence_score}%
                                    </p>
                                </div>
                                <button
                                    onClick={() => snapToHazard(hazard.hex_index)}
                                    title="Snap map to this hazard zone"
                                    className="shrink-0 ml-2 p-1.5 rounded bg-indigo-500/10 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-400 hover:text-indigo-200 transition-colors"
                                >
                                    <MapPin className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
