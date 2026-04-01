"use client";

import React, { useState, useEffect } from 'react';
import { useSimulation, DbHazard } from '../../context/SimulationContext';
import { Activity, ShieldAlert, MapPin, Layers, Plus, X, Check, Loader2, AlertCircle, ToggleLeft, ToggleRight, Trash2, ArrowLeft } from 'lucide-react';
import * as h3 from 'h3-js';
import DeleteConfirmModal from './DeleteConfirmModal';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
const HAZARD_TYPES = ['WATERLOGGING', 'TRAFFIC_JAM', 'ACCIDENT', 'SEVERE_STORM', 'ROAD_CLOSURE', 'FLOOD', 'OTHER'];

interface HazardForm {
    hazard_type: string;
    custom_type: string;
    severity: string;
    confidence_score: string;
    hex_index: string[];
}

const emptyForm: HazardForm = { hazard_type: 'WATERLOGGING', custom_type: '', severity: '8', confidence_score: '100', hex_index: [] };

export default function EventTracker() {
    const { state, dispatch } = useSimulation();
    const [view, setView] = useState<'tracker' | 'create'>('tracker');
    const [form, setForm] = useState<HazardForm>(emptyForm);
    const [formError, setFormError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [togglingId, setTogglingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Initial load of hazards
    useEffect(() => {
        async function load() {
            try {
                const res = await fetch(`${API_BASE}/api/v1/hazards/`);
                if (!res.ok) return;
                const data: DbHazard[] = await res.json();
                dispatch({ type: 'SET_DB_HAZARDS', payload: data });
            } catch { /* silent fail */ }
        }
        load();
    }, [dispatch]);

    // Sync multi-hex picker result into form
    useEffect(() => {
        if (view === 'create' && state.pendingHazardHexes.length > 0) {
            setForm(f => ({ ...f, hex_index: state.pendingHazardHexes }));
        } else if (view === 'create' && state.pendingHazardHexes.length === 0) {
            setForm(f => ({ ...f, hex_index: [] }));
        }
    }, [state.pendingHazardHexes, view]);

    const snapToHazard = (hexes: string[]) => {
        if (!hexes || hexes.length === 0) return;
        try {
            const [lat, lng] = h3.cellToLatLng(hexes[0]);
            dispatch({ type: 'FOCUS_LOCATION', payload: { location: [lat, lng] } });
        } catch { /* ignore */ }
    };

    const toggleHazard = async (hazard: DbHazard) => {
        setTogglingId(hazard.id);
        try {
            const res = await fetch(`${API_BASE}/api/v1/hazards/${hazard.id}/toggle`, { method: 'PATCH' });
            if (!res.ok) return;
            const updated: DbHazard = await res.json();
            dispatch({ type: 'TOGGLE_DB_HAZARD', payload: { id: updated.id, is_active: updated.is_active } });
            dispatch({ type: 'ADD_LOG', payload: { level: 'info', message: `Hazard Matrix Updated: ${updated.hazard_type} is now ${updated.is_active ? 'ONLINE' : 'OFFLINE'}` } });
        } catch { /* silent fail */ } finally {
            setTogglingId(null);
        }
    };

    const deleteHazard = async (id: string) => {
        try {
            const res = await fetch(`${API_BASE}/api/v1/hazards/${id}`, { method: 'DELETE' });
            if (res.ok) {
                dispatch({ type: 'REMOVE_DB_HAZARD', payload: { id } });
                dispatch({ type: 'ADD_LOG', payload: { level: 'warn', message: `Hazard Persistent Record Purged.` } });
            }
        } catch { /* silent fail */ } finally {
            setDeletingId(null);
        }
    };

    const saveEvent = async () => {
        if (form.hex_index.length === 0) { setFormError('Pick at least one hex zone from the map.'); return; }

        let finalType = form.hazard_type;
        if (finalType === 'OTHER') {
            if (!form.custom_type.trim()) { setFormError('Please enter the custom hazard name.'); return; }
            finalType = form.custom_type.trim().toUpperCase().replace(/\s+/g, '_');
        }

        setIsSubmitting(true);
        setFormError(null);
        try {
            const res = await fetch(`${API_BASE}/api/v1/hazards/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    hazard_type: finalType,
                    hex_index: form.hex_index,
                    confidence_score: Number(form.confidence_score),
                    severity: Number(form.severity),
                }),
            });
            if (!res.ok) throw new Error("Failed to create hazard record");

            const created: DbHazard = await res.json();
            dispatch({ type: 'ADD_DB_HAZARD', payload: created });
            dispatch({ type: 'ADD_LOG', payload: { level: 'info', message: `Persistent Hazard Created: ${finalType}` } });

            setView('tracker');
            setForm(emptyForm);
            dispatch({ type: 'DISABLE_HEX_SELECTION' });
        } catch (err: any) {
            setFormError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderTracker = () => (
        <div className="flex-1 flex flex-col min-h-0">
            <div className="grid grid-cols-1 gap-3 overflow-y-auto custom-scrollbar pr-1 pb-4">
                {state.dbHazards.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-[#908fa0] space-y-2 opacity-50 py-12">
                        <ShieldAlert className="w-8 h-8" />
                        <span className="text-xs">No hazard events detected</span>
                    </div>
                ) : (
                    state.dbHazards.map(hazard => (
                        <div
                            key={hazard.id}
                            className={`p-3 rounded-xl border transition-all duration-300 group relative overflow-hidden ${hazard.is_active ? 'bg-red-500/10 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.05)]' : 'bg-[#111827] border-[#31353f]'}`}
                        >
                            <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex gap-2">
                                <button
                                    onClick={() => snapToHazard(hazard.hex_index)}
                                    className="p-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all"
                                >
                                    <MapPin className="w-3 h-3" />
                                </button>
                                <button
                                    onClick={() => setDeletingId(hazard.id)}
                                    className="p-1 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-all"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>

                            <div className="flex items-start gap-3 relative z-10">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border shadow-inner ${hazard.is_active ? 'bg-red-500/20 border-red-500/40 text-red-400 animate-pulse' : 'bg-[#1f2937] border-[#31353f] text-[#505868]'}`}>
                                    <ShieldAlert className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className={`text-xs font-bold truncate uppercase tracking-tight ${hazard.is_active ? 'text-red-400' : 'text-[#908fa0]'}`}>
                                        {hazard.hazard_type.replace(/_/g, ' ')}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] text-[#505868] font-mono flex items-center gap-1 uppercase">
                                            Sev: <span className={hazard.is_active ? 'text-orange-400' : ''}>{hazard.severity}</span>
                                        </span>
                                        <span className="w-1 h-1 rounded-full bg-[#31353f]"></span>
                                        <span className="text-[10px] text-[#505868] font-mono flex items-center gap-1 uppercase">
                                            Zones: <span className={hazard.is_active ? 'text-indigo-400' : ''}>{hazard.hex_index.length}</span>
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-3 pt-3 border-t border-[#31353f]/50">
                                <button
                                    onClick={() => toggleHazard(hazard)}
                                    disabled={togglingId === hazard.id}
                                    className={`w-full flex items-center justify-center gap-2 py-1.5 rounded text-[10px] font-mono font-bold uppercase tracking-widest transition-all border ${hazard.is_active
                                        ? 'bg-[#1f2937] border-[#31353f] text-[#908fa0] hover:border-red-500/40 hover:text-red-300'
                                        : 'bg-red-600/20 border-red-500/30 text-red-300 hover:bg-red-600/40 shadow-lg shadow-red-500/10'
                                        }`}
                                >
                                    {togglingId === hazard.id
                                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        : hazard.is_active
                                            ? <><ToggleRight className="w-3.5 h-3.5" /> Force Standby</>
                                            : <><ToggleLeft className="w-3.5 h-3.5" /> Deploy Hazard</>
                                    }
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    const renderCreate = () => (
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1">
            <div className="bg-[#111827] border border-red-500/20 rounded-xl p-4 space-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2">
                    <button onClick={() => { setView('tracker'); dispatch({ type: 'DISABLE_HEX_SELECTION' }); }} className="text-[#505868] hover:text-white">
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                </div>

                <div className="space-y-4 pt-2">
                    <div>
                        <label className="block text-[10px] font-mono font-semibold text-[#908fa0] uppercase tracking-wider mb-1.5">Hazard Blueprint</label>
                        <select
                            value={form.hazard_type}
                            onChange={e => setForm(f => ({ ...f, hazard_type: e.target.value }))}
                            className="w-full bg-[#0a0e17] border border-[#31353f] rounded px-3 py-2 text-xs text-white outline-none focus:border-red-500/60 font-mono transition-all"
                        >
                            {HAZARD_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                        </select>
                    </div>

                    {form.hazard_type === 'OTHER' && (
                        <div className="animate-in fade-in slide-in-from-top-1">
                            <label className="block text-[10px] font-mono font-semibold text-red-400 uppercase tracking-wider mb-1.5">Custom Matrix Breach</label>
                            <input
                                type="text"
                                value={form.custom_type}
                                onChange={e => setForm(f => ({ ...f, custom_type: e.target.value }))}
                                placeholder="e.g., SEISMIC_UNSTABILITY"
                                className="w-full bg-[#0a0e17] border border-red-500/40 rounded px-3 py-2 text-xs text-white outline-none focus:border-red-500 font-mono"
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[10px] font-mono font-semibold text-[#908fa0] uppercase tracking-wider mb-1.5">Severity (1–10)</label>
                            <input
                                type="number" min={1} max={10}
                                value={form.severity}
                                onChange={e => setForm(f => ({ ...f, severity: e.target.value }))}
                                className="w-full bg-[#0a0e17] border border-[#31353f] rounded px-3 py-2 text-xs text-white outline-none focus:border-red-500/60 font-mono"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-mono font-semibold text-[#908fa0] uppercase tracking-wider mb-1.5">Confidence %</label>
                            <input
                                type="number" min={0} max={100}
                                value={form.confidence_score}
                                onChange={e => setForm(f => ({ ...f, confidence_score: e.target.value }))}
                                className="w-full bg-[#0a0e17] border border-[#31353f] rounded px-3 py-2 text-xs text-white outline-none focus:border-red-500/60 font-mono"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-[10px] font-mono font-semibold text-[#908fa0] uppercase tracking-wider">Breach Target Zones</label>
                            <span className="text-[9px] text-red-400 font-mono px-1.5 py-0.5 bg-red-500/10 rounded border border-red-500/20">{form.hex_index.length} Zones Locked</span>
                        </div>
                        <div className="flex gap-2">
                            <div className="flex-1 bg-[#0a0e17] border border-[#31353f] rounded px-3 py-2 text-[10px] text-white min-h-[40px] max-h-[100px] overflow-y-auto custom-scrollbar font-mono flex flex-wrap gap-1.5">
                                {form.hex_index.length === 0 ? (
                                    <span className="text-[#505868] italic italic-none">Select network nodes on map...</span>
                                ) : (
                                    form.hex_index.map(hex => (
                                        <span key={hex} className="bg-red-500/10 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded text-[10px] flex items-center gap-1 transition-all">
                                            {hex.slice(-6)} <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => dispatch({ type: 'TOGGLE_HAZARD_HEX', payload: { cellId: hex } })} />
                                        </span>
                                    ))
                                )}
                            </div>
                            <button
                                onClick={() => dispatch({ type: 'ENABLE_HEX_SELECTION', payload: { type: 'HAZARD' } })}
                                className={`shrink-0 p-2.5 rounded border transition-all ${state.hexSelectionMode && state.hexSelectionType === 'HAZARD' ? 'bg-red-600 border-red-400 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-[#0a0e17] border-[#31353f] text-[#908fa0] hover:border-red-500/60 hover:text-red-300'}`}
                            >
                                <MapPin className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {formError && (
                    <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded p-3">
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                        <p className="text-xs text-red-400 font-mono">{formError}</p>
                    </div>
                )}

                <div className="pt-2">
                    <button
                        onClick={saveEvent}
                        disabled={isSubmitting}
                        className="group relative w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white py-3 rounded-lg font-mono font-bold text-xs uppercase tracking-widest transition-all border border-red-500/50 shadow-xl shadow-red-500/20"
                    >
                        {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Persisting breach…</> : <><Check className="w-4 h-4" /> Commit Hazard Network</>}
                    </button>
                    <button
                        onClick={() => { setView('tracker'); dispatch({ type: 'DISABLE_HEX_SELECTION' }); }}
                        className="w-full mt-3 py-1.5 text-[10px] font-mono text-[#505868] hover:text-white transition-colors tracking-widest uppercase"
                    >
                        ABORT CREATION
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col p-4 bg-[#0a0e17] border-l border-[#31353f] border-t overflow-hidden relative">
            <DeleteConfirmModal
                isOpen={!!deletingId}
                onClose={() => setDeletingId(null)}
                onConfirm={() => deletingId && deleteHazard(deletingId)}
                title="PURGE HAZARD EVENT"
                description={`Permanently erase this hazard network from the simulation matrix?`}
                isDeleting={false}
            />

            <div className="flex items-center justify-between mb-4 shrink-0 px-1">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-4 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                    <h2 className="text-sm font-bold text-white uppercase tracking-widest">
                        {view === 'tracker' ? 'Event Tracker' : 'Hazard Deployment'}
                    </h2>
                </div>
                {view === 'tracker' && (
                    <button
                        onClick={() => { setView('create'); setForm(emptyForm); dispatch({ type: 'DISABLE_HEX_SELECTION' }); }}
                        className="bg-red-600/20 hover:bg-red-600/40 text-red-300 p-1.5 rounded-lg transition-all shadow-lg shadow-red-500/10 border border-red-500/30"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-hidden flex flex-col">
                {view === 'tracker' ? renderTracker() : renderCreate()}
            </div>
        </div>
    );
}
