"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Search, X, MapPin, Loader2 } from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';

interface NominatimResult {
    display_name: string;
    lat: string;
    lon: string;
}

export default function MapSearchBar() {
    const { dispatch } = useSimulation();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<NominatimResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (query.trim().length < 3) {
            setResults([]);
            setShowDropdown(false);
            return;
        }
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=in`,
                    { headers: { 'Accept-Language': 'en' } }
                );
                const data: NominatimResult[] = await res.json();
                setResults(data);
                setShowDropdown(data.length > 0);
            } catch { /* silent */ }
            finally { setLoading(false); }
        }, 400);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [query]);

    const snapToLocation = (result: NominatimResult) => {
        dispatch({ type: 'FOCUS_LOCATION', payload: { location: [parseFloat(result.lat), parseFloat(result.lon)] } });
        setQuery(result.display_name.split(',')[0]);
        setShowDropdown(false);
    };

    const clear = () => { setQuery(''); setResults([]); setShowDropdown(false); inputRef.current?.focus(); };

    return (
        // Relative container so dropdown is anchored below the input
        <div className="relative">
            {/* Compact input — same height as the glass badges */}
            <div className={`flex items-center gap-1.5 bg-[#111827]/80 backdrop-blur-md border ${showDropdown ? 'border-indigo-500/60 rounded-t rounded-b-none' : 'border-[#31353f] rounded'} px-2 py-1 transition-all w-[200px]`}>
                {loading
                    ? <Loader2 className="w-3 h-3 text-indigo-400 shrink-0 animate-spin" />
                    : <Search className="w-3 h-3 text-[#908fa0] shrink-0" />
                }
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onFocus={() => results.length > 0 && setShowDropdown(true)}
                    onKeyDown={e => e.key === 'Escape' && clear()}
                    placeholder="Search location..."
                    className="flex-1 bg-transparent text-[11px] text-white placeholder:text-[#908fa0] outline-none font-mono min-w-0"
                />
                {query && (
                    <button onClick={clear} className="text-[#908fa0] hover:text-white transition-colors shrink-0">
                        <X className="w-3 h-3" />
                    </button>
                )}
            </div>

            {/* Dropdown */}
            {showDropdown && results.length > 0 && (
                <div className="absolute left-0 top-full w-[280px] bg-[#111827]/95 backdrop-blur-md border border-indigo-500/40 border-t-0 rounded-b overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.7)] z-50">
                    {results.map((r, i) => (
                        <button
                            key={i}
                            onClick={() => snapToLocation(r)}
                            className="w-full flex items-start gap-2 px-3 py-2 hover:bg-indigo-500/10 transition-colors text-left border-t border-[#1f2937] first:border-t-0"
                        >
                            <MapPin className="w-3 h-3 text-indigo-400 mt-0.5 shrink-0" />
                            <div>
                                <div className="text-[11px] text-white font-medium leading-tight">{r.display_name.split(',')[0]}</div>
                                <div className="text-[10px] text-[#908fa0] mt-0.5 leading-tight line-clamp-1">
                                    {r.display_name.split(',').slice(1, 3).join(',').trim()}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
