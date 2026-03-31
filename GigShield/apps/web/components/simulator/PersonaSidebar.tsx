"use client";

import React, { useState, useEffect } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { UserCircle, UserPlus, MapPin, X, Check, Loader2, AlertCircle, Trash2 } from 'lucide-react';
import DeleteConfirmModal from './DeleteConfirmModal';
import * as h3 from 'h3-js';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
const VEHICLE_TYPES = ['EV', 'PETROL'];

interface NewUserForm {
    name: string;
    age: string;
    zomato_id: string;
    vehicle_type: string;
    primary_h3_zone: string;
}

const emptyForm: NewUserForm = {
    name: '',
    age: '',
    zomato_id: '',
    vehicle_type: 'EV',
    primary_h3_zone: '',
};

function Field({
    label, name, type = 'text', placeholder, value, onChange, error
}: {
    label: string; name: string; type?: string; placeholder?: string;
    value: string; onChange: (val: string) => void; error?: string;
}) {
    return (
        <div className="animate-in fade-in slide-in-from-top-1 duration-300">
            <label className="block text-[10px] font-mono font-semibold text-[#908fa0] uppercase tracking-wider mb-1">{label}</label>
            <input
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className={`w-full bg-[#0a0e17] border ${error ? 'border-red-500/60 shadow-[0_0_10px_rgba(239,68,68,0.1)]' : 'border-[#31353f]'} rounded px-2.5 py-1.5 text-xs text-white placeholder:text-[#505868] outline-none focus:border-indigo-500/60 transition-all font-mono`}
            />
            {error && <span className="text-[10px] text-red-500 font-medium mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {error}
            </span>}
        </div>
    );
}

export default function PersonaSidebar() {
    const { state, dispatch } = useSimulation();
    const [isAdding, setIsAdding] = useState(false);
    const [form, setForm] = useState<NewUserForm>(emptyForm);
    const [errors, setErrors] = useState<Partial<NewUserForm>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // ── Fetch real riders from DB on mount ─────────────────────────────────────
    useEffect(() => {
        let cancelled = false;
        async function loadRiders() {
            try {
                const res = await fetch(`${API_BASE}/api/v1/riders/`);
                if (!res.ok) throw new Error(`Server error ${res.status}`);
                const data = await res.json();

                if (cancelled) return;

                const riders = data.map((r: any) => {
                    let location: [number, number] = [22.273575, 73.160189];
                    if (r.primary_h3_zone) {
                        try {
                            const center = h3.cellToLatLng(r.primary_h3_zone);
                            location = [center[0], center[1]];
                        } catch { /* fallback */ }
                    }
                    return {
                        id: r.id,
                        name: r.name,
                        age: r.age,
                        zomatoId: r.zomato_id,
                        vehicleType: r.vehicle_type,
                        trustScore: r.trust_score,
                        location,
                        status: 'ACTIVE' as const,
                        primaryH3Zone: r.primary_h3_zone ?? null,
                    };
                });

                dispatch({ type: 'SET_RIDERS', payload: riders });

                if (riders.length > 0) {
                    dispatch({ type: 'FOCUS_LOCATION', payload: { location: riders[0].location } });
                } else {
                    dispatch({ type: 'FOCUS_LOCATION', payload: { location: [22.273575, 73.160189] } });
                }
            } catch (err) {
                console.error('[PersonaSidebar] Failed to load riders:', err);
                dispatch({ type: 'SET_RIDERS', payload: [] });
            }
        }
        loadRiders();
        return () => { cancelled = true; };
    }, [dispatch]);

    useEffect(() => {
        if (state.pendingH3Zone) {
            setForm(f => ({ ...f, primary_h3_zone: state.pendingH3Zone! }));
        }
    }, [state.pendingH3Zone]);

    const startAdding = () => {
        setIsAdding(true);
        setForm(emptyForm);
        setErrors({});
        setSubmitError(null);
    };

    const cancelAdding = () => {
        setIsAdding(false);
        setForm(emptyForm);
        setErrors({});
        setSubmitError(null);
        dispatch({ type: 'DISABLE_HEX_SELECTION' });
    };

    const activateHexPicker = () => {
        dispatch({ type: 'ENABLE_HEX_SELECTION', payload: { type: 'RIDER' } });
    };

    const validate = (): boolean => {
        const e: Partial<NewUserForm> = {};
        if (!form.name.trim()) e.name = 'Required';
        if (!form.age || isNaN(Number(form.age)) || Number(form.age) < 18) e.age = 'Valid age ≥ 18';
        if (!form.zomato_id.trim()) e.zomato_id = 'Required';
        if (!form.primary_h3_zone.trim()) e.primary_h3_zone = 'Pick a zone from the map';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const confirmUser = async () => {
        if (!validate()) return;
        setIsSubmitting(true);
        setSubmitError(null);

        try {
            const res = await fetch(`${API_BASE}/api/v1/riders/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: form.name.trim(),
                    age: Number(form.age),
                    zomato_id: form.zomato_id.trim(),
                    vehicle_type: form.vehicle_type,
                    primary_h3_zone: form.primary_h3_zone,
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail ?? `Server error ${res.status}`);
            }

            const created = await res.json();

            let location: [number, number] = [22.273575, 73.160189];
            if (created.primary_h3_zone) {
                try {
                    const center = h3.cellToLatLng(created.primary_h3_zone);
                    location = [center[0], center[1]];
                } catch { /* fallback */ }
            }

            dispatch({
                type: 'ADD_RIDER',
                payload: {
                    id: created.id,
                    name: created.name,
                    age: created.age,
                    zomatoId: created.zomato_id,
                    vehicleType: created.vehicle_type,
                    trustScore: created.trust_score,
                    location,
                    status: 'ACTIVE',
                    primaryH3Zone: created.primary_h3_zone ?? null,
                },
            });

            dispatch({ type: 'FOCUS_LOCATION', payload: { location } });
            setIsAdding(false);
            setForm(emptyForm);
        } catch (err: unknown) {
            setSubmitError(err instanceof Error ? err.message : 'Unknown error. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const deleteRider = async (id: string) => {
        try {
            const res = await fetch(`${API_BASE}/api/v1/riders/${id}`, { method: 'DELETE' });
            if (res.ok) {
                dispatch({ type: 'REMOVE_RIDER', payload: { id } });
            } else {
                alert('Purge failed on server.');
            }
        } catch (err) {
            console.error('Delete rider failed:', err);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="h-full flex flex-col bg-[#111827] border-r border-[#31353f] p-4 text-[#dfe2ef]">
            <DeleteConfirmModal
                isOpen={!!deletingId}
                onClose={() => setDeletingId(null)}
                onConfirm={() => deletingId && deleteRider(deletingId)}
                title="PURGE RIDER"
                description={`Are you sure you want to permanently detach ${state.riders.find(r => r.id === deletingId)?.name} from the matrix?`}
                isDeleting={false} // deleteRider handles the actual API wait after confirm
            />

            <div className="flex items-center justify-between mb-4 shrink-0">
                <div className="flex items-center space-x-2">
                    <UserCircle className="w-5 h-5 text-indigo-400" />
                    <h2 className="text-lg font-display font-semibold tracking-wide text-white">User Matrix</h2>
                </div>
                {!isAdding && (
                    <button
                        onClick={startAdding}
                        className="flex items-center gap-1.5 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 text-[11px] font-mono font-semibold px-2.5 py-1.5 rounded border border-indigo-500/30 transition-colors"
                    >
                        <UserPlus className="w-3.5 h-3.5" />
                        New Rider
                    </button>
                )}
            </div>

            {isAdding ? (
                <div className="flex-1 flex flex-col min-h-0 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="flex items-center justify-between mb-3 shrink-0">
                        <h3 className="text-sm font-semibold text-indigo-300 uppercase tracking-wider">Onboard New Node</h3>
                        <button onClick={cancelAdding} className="text-[#908fa0] hover:text-white transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1 min-h-0 pb-4">
                        <Field label="Name" name="name" placeholder="Arjun Sharma"
                            value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} error={errors.name} />
                        <Field label="Age" name="age" type="number" placeholder="24"
                            value={form.age} onChange={v => setForm(f => ({ ...f, age: v }))} error={errors.age} />
                        <Field label="Zomato ID" name="zomato_id" placeholder="ZOM-R-2099"
                            value={form.zomato_id} onChange={v => setForm(f => ({ ...f, zomato_id: v }))} error={errors.zomato_id} />

                        <div>
                            <label className="block text-[10px] font-mono font-semibold text-[#908fa0] uppercase tracking-wider mb-1">Vehicle Module</label>
                            <select
                                value={form.vehicle_type}
                                onChange={e => setForm(f => ({ ...f, vehicle_type: e.target.value }))}
                                className="w-full bg-[#0a0e17] border border-[#31353f] rounded px-2.5 py-1.5 text-xs text-white outline-none focus:border-indigo-500/60 transition-colors font-mono"
                            >
                                {VEHICLE_TYPES.map(v => <option key={v} value={v}>{v}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-[10px] font-mono font-semibold text-[#908fa0] uppercase tracking-wider mb-1">Deployment Zone</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={form.primary_h3_zone}
                                    readOnly
                                    placeholder="Select from matrix map"
                                    className={`flex-1 bg-[#0a0e17] border ${errors.primary_h3_zone ? 'border-red-500/60' : 'border-[#31353f]'} rounded px-2.5 py-1.5 text-xs text-white placeholder:text-[#505868] outline-none font-mono cursor-default`}
                                />
                                <button
                                    onClick={activateHexPicker}
                                    title="Pick H3 zone from map"
                                    className={`shrink-0 px-2.5 py-1.5 rounded border text-xs transition-colors ${state.hexSelectionMode ? 'bg-indigo-500 border-indigo-400 text-white animate-pulse' : 'bg-[#0a0e17] border-[#31353f] text-[#908fa0] hover:border-indigo-500/60 hover:text-indigo-300'}`}
                                >
                                    <MapPin className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            {errors.primary_h3_zone && <span className="text-[10px] text-red-400 mt-1 block">{errors.primary_h3_zone}</span>}
                        </div>

                        {submitError && (
                            <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded p-2.5">
                                <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                                <p className="text-[10px] text-red-400 font-mono">{submitError}</p>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={confirmUser}
                        disabled={isSubmitting}
                        className="shrink-0 w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 rounded font-mono font-semibold text-sm transition-all border border-indigo-500/50 shadow-lg shadow-indigo-500/10"
                    >
                        {isSubmitting ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> INITIALIZING NODE…</>
                        ) : (
                            <><Check className="w-4 h-4" /> AUTHORIZE ONBOARDING</>
                        )}
                    </button>
                </div>
            ) : (
                <div className="flex-1 flex flex-col min-h-0">
                    <h3 className="text-sm font-semibold text-[#908fa0] uppercase tracking-wider mb-3 shrink-0">
                        Active Nodes ({state.riders.length})
                    </h3>

                    {state.isLoadingRiders ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-2 text-[#505868]">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span className="text-xs font-mono">SCANNING MATRIX…</span>
                        </div>
                    ) : state.riders.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-2 text-[#505868]">
                            <UserCircle className="w-8 h-8 opacity-40" />
                            <p className="text-xs font-mono text-center">No nodes detected.<br />Begin onboarding sequence.</p>
                        </div>
                    ) : (
                        <ul className="space-y-3 overflow-y-auto custom-scrollbar pr-2 flex-1 min-h-0">
                            {state.riders.map(rider => (
                                <li key={rider.id} className="flex flex-col p-3 bg-[#0a0e17] rounded-md border border-[#31353f] transition-all hover:border-indigo-500/30 group">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex-1 min-w-0">
                                            <span className="font-semibold text-sm block tracking-tight">{rider.name}</span>
                                            {rider.zomatoId && (
                                                <span className="text-[10px] text-[#908fa0] font-mono block">{rider.zomatoId}</span>
                                            )}
                                            {rider.primaryH3Zone && (
                                                <span className="text-[10px] text-indigo-400 font-mono block truncate mt-0.5" title={rider.primaryH3Zone}>
                                                    ⬡ {rider.primaryH3Zone}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className={`w-2 h-2 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.4)] shrink-0 ${rider.status === 'ACTIVE' ? 'bg-green-500' : rider.status === 'DANGER' ? 'bg-red-500' : 'bg-gray-500'}`} />
                                            <button
                                                onClick={() => setDeletingId(rider.id)}
                                                className="p-1 rounded bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => dispatch({ type: 'TOGGLE_RIDER_STATUS', payload: { id: rider.id } })}
                                            className={`flex-1 text-[11px] py-1.5 rounded font-mono font-medium transition-colors ${rider.status === 'ACTIVE' ? 'bg-[#1f2937] text-[#908fa0] hover:bg-[#374151]' : 'bg-indigo-600 text-white hover:bg-indigo-500'}`}
                                        >
                                            {rider.status === 'ACTIVE' ? 'DEACTIVATE' : 'ACTIVATE'}
                                        </button>
                                        <button
                                            onClick={() => dispatch({ type: 'FOCUS_LOCATION', payload: { location: rider.location } })}
                                            className="flex-1 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 text-[11px] py-1.5 rounded font-mono font-medium transition-colors border border-indigo-500/20"
                                        >
                                            TRACK
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}
