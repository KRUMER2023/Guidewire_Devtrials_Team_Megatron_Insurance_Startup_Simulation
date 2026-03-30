"use client";

import React, { useState, useRef } from 'react';
import { Hexagon, X, AlertCircle } from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';
import * as h3 from 'h3-js';

export default function HexSearchBar() {
    const { dispatch } = useSimulation();
    const [value, setValue] = useState('');
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const clear = () => {
        setValue('');
        setError(null);
        dispatch({ type: 'CLEAR_HEX_HIGHLIGHT' });
        inputRef.current?.focus();
    };

    const snapToHex = (raw: string) => {
        const cellId = raw.trim();
        if (!cellId) { setError(null); dispatch({ type: 'CLEAR_HEX_HIGHLIGHT' }); return; }

        // Validate — h3.isValidCell throws on completely invalid strings
        if (!h3.isValidCell(cellId)) {
            setError('Invalid H3 index');
            dispatch({ type: 'CLEAR_HEX_HIGHLIGHT' });
            return;
        }

        setError(null);

        // Snap map to hex centroid
        const [lat, lng] = h3.cellToLatLng(cellId);
        dispatch({ type: 'FOCUS_LOCATION', payload: { location: [lat, lng] } });

        // Highlight the hex on the map
        dispatch({ type: 'HIGHLIGHT_HEX', payload: { cellId } });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value;
        setValue(v);
        // Clear highlight while user is still typing
        if (!v.trim()) {
            setError(null);
            dispatch({ type: 'CLEAR_HEX_HIGHLIGHT' });
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') snapToHex(value);
        if (e.key === 'Escape') clear();
    };

    return (
        <div className="relative flex flex-col">
            {/* Input row — same height and glass style as MapSearchBar */}
            <div
                className={`flex items-center gap-1.5 bg-[#111827]/80 backdrop-blur-md border ${error
                        ? 'border-red-500/60'
                        : 'border-[#31353f]'
                    } rounded px-2 py-1 transition-all w-[200px]`}
            >
                <Hexagon className="w-3 h-3 text-indigo-400 shrink-0" />
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    onBlur={() => snapToHex(value)}
                    placeholder="Search hex zone..."
                    spellCheck={false}
                    className="flex-1 bg-transparent text-[11px] text-white placeholder:text-[#908fa0] outline-none font-mono min-w-0"
                />
                {value && (
                    <button onClick={clear} className="text-[#908fa0] hover:text-white transition-colors shrink-0">
                        <X className="w-3 h-3" />
                    </button>
                )}
            </div>

            {/* Inline error tooltip */}
            {error && (
                <div className="absolute top-full mt-1 left-0 flex items-center gap-1 bg-red-900/80 backdrop-blur-md border border-red-500/40 rounded px-2 py-1 z-50 whitespace-nowrap">
                    <AlertCircle className="w-3 h-3 text-red-400 shrink-0" />
                    <span className="text-[10px] text-red-300 font-mono">{error}</span>
                </div>
            )}
        </div>
    );
}
