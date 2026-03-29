"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { Terminal } from 'lucide-react';

export default function ServerLog() {
    const { state } = useSimulation();
    const logEndRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted) {
            logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [state.logs, mounted]);

    return (
        <div className="h-full flex flex-col p-4 bg-[#0a0e17] border-t border-[#31353f] font-mono text-xs text-[#908fa0] overflow-hidden">
            <div className="flex items-center space-x-2 mb-2 pb-2 border-b border-[#1f2937] shrink-0">
                <Terminal className="w-4 h-4 text-indigo-400" />
                <h2 className="font-semibold text-[#dfe2ef]">SYS_LOGS</h2>
            </div>

            {/* Scrollable log area — mirrors the Trigger Room card scroll pattern */}
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 pr-2 min-h-0">
                {state.logs.map(log => (
                    <div key={log.id} className="flex items-start gap-2 py-0.5">
                        <span className="text-[#6366f1] whitespace-nowrap shrink-0">
                            [{mounted ? new Date(log.timestamp).toLocaleTimeString() : '...'}]
                        </span>
                        <span className={`break-all ${log.level === 'error' ? 'text-red-400' :
                            log.level === 'warn' ? 'text-orange-400' : 'text-gray-300'
                            }`}>
                            {log.message}
                        </span>
                    </div>
                ))}
                <div ref={logEndRef} />
            </div>
        </div>
    );
}
