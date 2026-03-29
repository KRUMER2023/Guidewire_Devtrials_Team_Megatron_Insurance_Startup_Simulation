"use client";

import React from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { Activity, ShieldAlert } from 'lucide-react';

export default function EventTracker() {
    const { state } = useSimulation();

    return (
        <div className="h-full flex flex-col p-4 bg-[#111827] border-l border-[#31353f] border-b">
            <div className="flex items-center space-x-2 mb-4">
                <Activity className="w-4 h-4 text-indigo-400" />
                <h2 className="text-sm font-semibold text-[#dfe2ef] tracking-wide">Event Tracker</h2>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
                {state.events.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-[#908fa0] space-y-2 opacity-50">
                        <ShieldAlert className="w-8 h-8" />
                        <span className="text-xs">No active events</span>
                    </div>
                ) : (
                    state.events.map(evt => (
                        <div key={evt.id} className={`p-3 rounded-lg border text-sm ${evt.intensity === 'RED' ? 'bg-red-500/10 border-red-500/30' : 'bg-orange-500/10 border-orange-500/30'}`}>
                            <div className="flex justify-between items-start mb-1">
                                <span className={`font-semibold ${evt.intensity === 'RED' ? 'text-red-400' : 'text-orange-400'}`}>
                                    {evt.type} Detected
                                </span>
                                <span className="text-[10px] text-[#908fa0]">
                                    {new Date(evt.timestamp).toLocaleTimeString()}
                                </span>
                            </div>
                            <div className="text-xs text-gray-300">
                                Lat: {evt.location[0].toFixed(4)}, Lng: {evt.location[1].toFixed(4)}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
