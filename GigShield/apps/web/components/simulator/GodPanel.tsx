"use client";

import React, { useState, useEffect } from 'react';
import { useSimulation, DbHazard } from '../../context/SimulationContext';
import { Plus, X, MapPin, Check, Loader2, AlertCircle, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
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

export default function GodPanel() {
    const { state, dispatch } = useSimulation();
    const [isAdding, setIsAdding] = useState(false);
    const [form, setForm] = useState<HazardForm>(emptyForm);
    const [formError, setFormError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [togglingId, setTogglingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Load all DB hazards on mount
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
        if (isAdding && state.pendingHazardHexes.length > 0) {
            setForm(f => ({ ...f, hex_index: state.pendingHazardHexes }));
        } else if (isAdding && state.pendingHazardHexes.length === 0) {
            setForm(f => ({ ...f, hex_index: [] }));
        }
    }, [state.pendingHazardHexes, isAdding]);

    const clearAll = () => dispatch({ type: 'CLEAR_DISASTER' });

    const startAdding = () => {
        setIsAdding(true);
        setForm(emptyForm);
        setFormError(null);
        dispatch({ type: 'DISABLE_HEX_SELECTION' });
    };

    const cancelAdding = () => {
        setIsAdding(false);
        setForm(emptyForm);
        setFormError(null);
        dispatch({ type: 'DISABLE_HEX_SELECTION' });
    };

    const saveEvent = async () => {
        if (form.hex_index.length === 0) { setFormError('Pick at least one hex zone from the map.'); return; }

        let finalType = form.hazard_type;
        if (finalType === 'OTHER') {
            if (!form.custom_type.trim()) { setFormError('Please enter the custom hazard name.'); return; }
            finalType = form.custom_type.trim().toUpperCase().replace(/\s+/g, '_');
        }

        const sev = Number(form.severity);
        if (isNaN(sev) || sev < 1 || sev > 10) { setFormError('Severity must be 1–10.'); return; }

        const conf = Number(form.confidence_score);
        if (isNaN(conf) || conf < 0 || conf > 100) { setFormError('Confidence must be 0–100.'); return; }

        setIsSubmitting(true);
        setFormError(null);
        try {
            const res = await fetch(`${API_BASE}/api/v1/hazards/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    hazard_type: finalType,
                    hex_index: form.hex_index,
                    confidence_score: conf,
                    severity: sev,
                }),
            });
            if (!res.ok) {
                const e = await res.json();
                const msg = typeof e.detail === 'string'
                    ? e.detail
                    : Array.isArray(e.detail)
                        ? e.detail.map((d: any) => `${d.loc?.[1] || d.type}: ${d.msg}`).join(', ')
                        : JSON.stringify(e.detail) || `Error ${res.status}`;
                throw new Error(msg);
            }
            const created: DbHazard = await res.json();
            dispatch({ type: 'ADD_DB_HAZARD', payload: created });
            setIsAdding(false);
            setForm(emptyForm);
            dispatch({ type: 'DISABLE_HEX_SELECTION' });
        } catch (err: unknown) {
            setFormError(err instanceof Error ? err.message : 'Failed to save event.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleHazard = async (hazard: DbHazard) => {
        setTogglingId(hazard.id);
        try {
            const res = await fetch(`${API_BASE}/api/v1/hazards/${hazard.id}/toggle`, { method: 'PATCH' });
            if (!res.ok) return;
            const updated: DbHazard = await res.json();
            dispatch({ type: 'TOGGLE_DB_HAZARD', payload: { id: updated.id, is_active: updated.is_active } });
        } catch { /* silent fail */ } finally {
            setTogglingId(null);
        }
    };

    const deleteHazard = async (id: string) => {
        try {
            const res = await fetch(`${API_BASE}/api/v1/hazards/${id}`, { method: 'DELETE' });
            if (res.ok) {
                dispatch({ type: 'REMOVE_DB_HAZARD', payload: { id } });
            }
        } catch { /* silent fail */ } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="h-full flex flex-col p-4 bg-[#0a0e17] border-l border-[#31353f] border-t overflow-hidden relative">
            <DeleteConfirmModal
                isOpen={!!deletingId}
                onClose={() => setDeletingId(null)}
                onConfirm={() => deletingId && deleteHazard(deletingId)}
                title="PURGE HAZARD EVENT"
                description={`Are you sure you want to permanently erase this hazard network from the matrix?`}
                isDeleting={false}
            />

            <div className="flex items-center justify-between mb-3 shrink-0">
                <h2 className="text-sm font-semibold text-[#908fa0] uppercase tracking-wider">Trigger Room</h2>
                <div className="flex items-center gap-2">
                    {!isAdding && (
                        <button
                            onClick={startAdding}
                            className="flex items-center gap-1 bg-red-600/20 hover:bg-red-600/40 text-red-300 text-[11px] font-mono font-semibold px-2.5 py-1.5 rounded border border-red-500/30 transition-colors"
                        >
                            <Plus className="w-3 h-3" /> Add Event
                        </button>
                    )}
                    <button onClick={clearAll} className="text-xs text-[#908fa0] hover:text-red-300 transition-colors">Clear All</button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1 min-h-0">
                {isAdding && (
                    <div className="bg-[#111827] border border-red-500/25 rounded-xl p-3 space-y-2.5 animate-in slide-in-from-top-2 duration-300">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-red-300 uppercase tracking-wider">New Hazard Event</span>
                            <button onClick={cancelAdding}><X className="w-3.5 h-3.5 text-[#908fa0] hover:text-white" /></button>
                        </div>

                        <div className="space-y-2">
                            <div>
                                <label className="block text-[10px] font-mono font-semibold text-[#908fa0] uppercase tracking-wider mb-1">Hazard Type</label>
                                <select
                                    value={form.hazard_type}
                                    onChange={e => setForm(f => ({ ...f, hazard_type: e.target.value }))}
                                    className="w-full bg-[#0a0e17] border border-[#31353f] rounded px-2.5 py-1.5 text-xs text-white outline-none focus:border-red-500/60 font-mono"
                                >
                                    {HAZARD_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                                </select>
                            </div>

                            {form.hazard_type === 'OTHER' && (
                                <div className="animate-in fade-in slide-in-from-top-1">
                                    <label className="block text-[10px] font-mono font-semibold text-red-400 uppercase tracking-wider mb-1">Custom Event Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., POWER_OUTAGE"
                                        value={form.custom_type}
                                        onChange={e => setForm(f => ({ ...f, custom_type: e.target.value }))}
                                        className="w-full bg-[#0a0e17] border border-red-500/40 rounded px-2.5 py-1.5 text-xs text-white outline-none focus:border-red-500 font-mono"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[10px] font-mono font-semibold text-[#908fa0] uppercase tracking-wider mb-1">Severity (1–10)</label>
                                <input
                                    type="number" min={1} max={10}
                                    value={form.severity}
                                    onChange={e => setForm(f => ({ ...f, severity: e.target.value }))}
                                    className="w-full bg-[#0a0e17] border border-[#31353f] rounded px-2.5 py-1.5 text-xs text-white outline-none focus:border-red-500/60 font-mono"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-mono font-semibold text-[#908fa0] uppercase tracking-wider mb-1">Confidence %</label>
                                <input
                                    type="number" min={0} max={100}
                                    value={form.confidence_score}
                                    onChange={e => setForm(f => ({ ...f, confidence_score: e.target.value }))}
                                    className="w-full bg-[#0a0e17] border border-[#31353f] rounded px-2.5 py-1.5 text-xs text-white outline-none focus:border-red-500/60 font-mono"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="block text-[10px] font-mono font-semibold text-[#908fa0] uppercase tracking-wider">Hazard Zones</label>
                                <span className="text-[9px] text-indigo-400 font-mono px-1.5 py-0.5 bg-indigo-500/10 rounded border border-indigo-500/20">{form.hex_index.length} selected</span>
                            </div>
                            <div className="flex gap-2">
                                <div className="flex-1 bg-[#0a0e17] border border-[#31353f] rounded px-2.5 py-1.5 text-xs text-white min-h-[32px] max-h-[80px] overflow-y-auto custom-scrollbar font-mono flex flex-wrap gap-1">
                                    {form.hex_index.length === 0 ? (
                                        <span className="text-[#505868]">Click pin to select multiples</span>
                                    ) : (
                                        form.hex_index.map(hex => (
                                            <span key={hex} className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-1 rounded-[2px] text-[10px] flex items-center gap-1">
                                                {hex.slice(-4)} <X className="w-2 h-2 cursor-pointer hover:text-white" onClick={() => dispatch({ type: 'TOGGLE_HAZARD_HEX', payload: { cellId: hex } })} />
                                            </span>
                                        ))
                                    )}
                                </div>
                                <button
                                    onClick={() => dispatch({ type: 'ENABLE_HEX_SELECTION', payload: { type: 'HAZARD' } })}
                                    className={`shrink-0 px-2.5 py-1.5 rounded border text-xs transition-colors ${state.hexSelectionMode && state.hexSelectionType === 'HAZARD' ? 'bg-red-500 border-red-400 text-white animate-pulse' : 'bg-[#0a0e17] border-[#31353f] text-[#908fa0] hover:border-red-500/60 hover:text-red-300'}`}
                                >
                                    <MapPin className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>

                        {formError && (
                            <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded p-2">
                                <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                                <p className="text-[10px] text-red-400 font-mono">{formError}</p>
                            </div>
                        )}

                        <button
                            onClick={saveEvent}
                            disabled={isSubmitting}
                            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white py-2 rounded font-mono font-semibold text-xs transition-colors border border-red-500/50 shadow-lg shadow-red-500/20"
                        >
                            {isSubmitting ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</> : <><Check className="w-3.5 h-3.5" /> Create Hazard Network</>}
                        </button>
                    </div>
                )}

                {state.dbHazards.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-[10px] font-mono text-[#908fa0] uppercase tracking-wider">Saved Events ({state.dbHazards.length})</p>
                        {state.dbHazards.map(h => (
                            <div key={h.id} className={`p-3 rounded-lg border text-xs transition-all duration-300 group ${h.is_active ? 'bg-red-500/10 border-red-500/30 ring-1 ring-red-500/20' : 'bg-[#111827] border-[#31353f]'}`}>
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <div className="min-w-0">
                                        <p className={`font-semibold truncate uppercase tracking-tight ${h.is_active ? 'text-red-400' : 'text-[#908fa0]'}`}>{h.hazard_type.replace(/_/g, ' ')}</p>
                                        <p className="text-[10px] text-indigo-400 font-mono truncate">⬡ {h.hex_index.length} zones</p>
                                        <p className="text-[10px] text-[#908fa0]">S:{h.severity} · C:{h.confidence_score}%</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1.5">
                                        <span className={`shrink-0 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full border ${h.is_active ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-[#1f2937] border-[#31353f] text-[#908fa0]'}`}>
                                            {h.is_active ? 'ACTIVE' : 'OFF'}
                                        </span>
                                        <button
                                            onClick={() => setDeletingId(h.id)}
                                            className="p-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                                <button
                                    onClick={() => toggleHazard(h)}
                                    disabled={togglingId === h.id || !!deletingId}
                                    className={`w-full flex items-center justify-center gap-1.5 py-1.5 rounded text-[11px] font-mono font-semibold transition-colors border ${h.is_active
                                        ? 'bg-[#1f2937] border-[#31353f] text-[#908fa0] hover:border-red-500/40 hover:text-red-300'
                                        : 'bg-red-600/20 border-red-500/30 text-red-300 hover:bg-red-600/40'
                                        }`}
                                >
                                    {togglingId === h.id
                                        ? <Loader2 className="w-3 h-3 animate-spin" />
                                        : h.is_active
                                            ? <><ToggleRight className="w-3.5 h-3.5" /> Deactivate</>
                                            : <><ToggleLeft className="w-3.5 h-3.5" /> Activate</>
                                    }
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
