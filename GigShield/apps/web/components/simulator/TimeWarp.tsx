"use client";

import React, { useState } from 'react';
import { Play, Pause, FastForward } from 'lucide-react';

export default function TimeWarp() {
    const [speed, setSpeed] = useState<1 | 2 | 5>(1);
    const [isPlaying, setIsPlaying] = useState(true);

    return (
        <div className="h-full p-4 bg-[#0a0e17] border-l border-t border-[#31353f] flex flex-col justify-center items-center">
            <h2 className="text-xs font-semibold text-[#908fa0] uppercase tracking-wider mb-4 w-full text-left">Time Control</h2>

            <div className="flex items-center space-x-4 bg-[#111827] p-2 rounded-lg border border-[#31353f]">
                <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className={`p-2 rounded-md transition-colors ${!isPlaying ? 'bg-indigo-500/20 text-indigo-400' : 'text-[#908fa0] hover:text-white'}`}
                >
                    <Pause className="w-4 h-4" fill={!isPlaying ? "currentColor" : "none"} />
                </button>

                <button
                    onClick={() => { setIsPlaying(true); setSpeed(1); }}
                    className={`p-2 rounded-md transition-colors ${isPlaying && speed === 1 ? 'bg-indigo-500/20 text-indigo-400' : 'text-[#908fa0] hover:text-white'}`}
                >
                    <Play className="w-4 h-4" fill={isPlaying && speed === 1 ? "currentColor" : "none"} />
                </button>

                <button
                    onClick={() => { setIsPlaying(true); setSpeed(speed === 5 ? 2 : 5); }}
                    className={`p-2 rounded-md transition-colors flex items-center space-x-1 ${isPlaying && speed > 1 ? 'bg-indigo-500/20 text-indigo-400' : 'text-[#908fa0] hover:text-white'}`}
                >
                    <FastForward className="w-4 h-4" fill={isPlaying && speed > 1 ? "currentColor" : "none"} />
                    {speed > 1 && <span className="text-[10px] font-mono leading-none">{speed}x</span>}
                </button>
            </div>

            <div className="mt-3 text-[10px] text-[#908fa0] font-mono">
                {isPlaying ? `SIMULATION RUNNING AT ${speed}X` : 'SIMULATION PAUSED'}
            </div>
        </div>
    );
}
