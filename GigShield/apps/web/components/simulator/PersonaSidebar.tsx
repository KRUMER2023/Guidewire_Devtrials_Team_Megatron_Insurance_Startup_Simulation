"use client";

import React, { useState, useEffect } from 'react';
import { useSimulation } from '../../context/SimulationContext';
import { UserCircle, UserPlus, MapPin, X, Check } from 'lucide-react';
import * as h3 from 'h3-js';

const VEHICLE_TYPES = ['EV', 'PETROL'];

interface NewUserForm {
    name: string;
    age: string;
    zomato_id: string;
    vehicle_type: string;
    trust_score: string;
    primary_h3_zone: string;
}

const emptyForm: NewUserForm = {
    name: '',
    age: '',
    zomato_id: '',
    vehicle_type: 'EV',
    trust_score: '80',
    primary_h3_zone: '',
};

// Defined OUTSIDE PersonaSidebar to prevent remount on every render (fixes input focus loss)
function Field({
    label, name, type = 'text', placeholder, value, onChange, error
}: {
    label: string; name: string; type?: string; placeholder?: string;
    value: string; onChange: (val: string) => void; error?: string;
}) {
    return (
        <div>
            <label className="block text-[10px] font-mono font-semibold text-[#908fa0] uppercase tracking-wider mb-1">{label}</label>
            <input
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className={`w-full bg-[#0a0e17] border ${error ? 'border-red-500/60' : 'border-[#31353f]'} rounded px-2.5 py-1.5 text-xs text-white placeholder:text-[#505868] outline-none focus:border-indigo-500/60 transition-colors font-mono`}
            />
            {error && <span className="text-[10px] text-red-400 mt-0.5 block">{error}</span>}
        </div>
    );
}

export default function PersonaSidebar() {
    const { state, dispatch } = useSimulation();
    const [isAdding, setIsAdding] = useState(false);
    const [form, setForm] = useState<NewUserForm>(emptyForm);
    const [errors, setErrors] = useState<Partial<NewUserForm>>({});

    // When map picks a hex zone, auto-fill the field
    useEffect(() => {
        if (state.pendingH3Zone) {
            setForm(f => ({ ...f, primary_h3_zone: state.pendingH3Zone! }));
        }
    }, [state.pendingH3Zone]);

    const startAdding = () => {
        setIsAdding(true);
        setForm(emptyForm);
        setErrors({});
    };

    const cancelAdding = () => {
        setIsAdding(false);
        setForm(emptyForm);
        setErrors({});
        dispatch({ type: 'DISABLE_HEX_SELECTION' });
    };

    const activateHexPicker = () => {
        dispatch({ type: 'ENABLE_HEX_SELECTION' });
    };

    const validate = (): boolean => {
        const e: Partial<NewUserForm> = {};
        if (!form.name.trim()) e.name = 'Required';
        if (!form.age || isNaN(Number(form.age)) || Number(form.age) < 18) e.age = 'Valid age ≥ 18';
        if (!form.zomato_id.trim()) e.zomato_id = 'Required';
        if (!form.trust_score || isNaN(Number(form.trust_score))) e.trust_score = '0–100';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const confirmUser = () => {
        if (!validate()) return;

        // Compute location from H3 zone, or default to Delhi center
        let location: [number, number] = [28.6139, 77.2090];
        if (form.primary_h3_zone) {
            try {
                const center = h3.cellToLatLng(form.primary_h3_zone);
                location = [center[0], center[1]];
            } catch { /* fallback to default */ }
        }

        const newRider = {
            id: `R-${Date.now()}`,
            name: form.name.trim(),
            age: Number(form.age),
            zomatoId: form.zomato_id.trim(),
            vehicleType: form.vehicle_type,
            trustScore: Number(form.trust_score),
            location,
            status: 'ACTIVE' as const,
            primaryH3Zone: form.primary_h3_zone || null,
        };

        dispatch({ type: 'ADD_RIDER', payload: newRider });
        dispatch({ type: 'FOCUS_LOCATION', payload: { location } });
        setIsAdding(false);
        setForm(emptyForm);
    };

    return (
        <div className="h-full flex flex-col bg-[#111827] border-r border-[#31353f] p-4 text-[#dfe2ef]">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 shrink-0">
                <div className="flex items-center space-x-2">
                    <UserCircle className="w-5 h-5 text-indigo-400" />
                    <h2 className="text-lg font-display font-semibold tracking-wide text-white">User Management</h2>
                </div>
                {!isAdding && (
                    <button
                        onClick={startAdding}
                        className="flex items-center gap-1.5 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 text-[11px] font-mono font-semibold px-2.5 py-1.5 rounded border border-indigo-500/30 transition-colors"
                    >
                        <UserPlus className="w-3.5 h-3.5" />
                        New User
                    </button>
                )}
            </div>

            {isAdding ? (
                /* ── Add New User Form ── */
                <div className="flex-1 flex flex-col min-h-0">
                    <div className="flex items-center justify-between mb-3 shrink-0">
                        <h3 className="text-sm font-semibold text-indigo-300 uppercase tracking-wider">Add New User</h3>
                        <button onClick={cancelAdding} className="text-[#908fa0] hover:text-white transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1 min-h-0">
                        <Field label="Name" name="name" placeholder="e.g. Arjun Sharma"
                            value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} error={errors.name} />
                        <Field label="Age" name="age" type="number" placeholder="e.g. 24"
                            value={form.age} onChange={v => setForm(f => ({ ...f, age: v }))} error={errors.age} />
                        <Field label="Zomato ID" name="zomato_id" placeholder="e.g. ZOM-R-2099"
                            value={form.zomato_id} onChange={v => setForm(f => ({ ...f, zomato_id: v }))} error={errors.zomato_id} />

                        {/* Vehicle Type Dropdown */}
                        <div>
                            <label className="block text-[10px] font-mono font-semibold text-[#908fa0] uppercase tracking-wider mb-1">Vehicle Type</label>
                            <select
                                value={form.vehicle_type}
                                onChange={e => setForm(f => ({ ...f, vehicle_type: e.target.value }))}
                                className="w-full bg-[#0a0e17] border border-[#31353f] rounded px-2.5 py-1.5 text-xs text-white outline-none focus:border-indigo-500/60 transition-colors font-mono"
                            >
                                {VEHICLE_TYPES.map(v => <option key={v} value={v}>{v}</option>)}
                            </select>
                        </div>

                        <Field label="Trust Score (0–100)" name="trust_score" type="number" placeholder="80"
                            value={form.trust_score} onChange={v => setForm(f => ({ ...f, trust_score: v }))} error={errors.trust_score} />

                        {/* Primary H3 Zone with Map Picker */}
                        <div>
                            <label className="block text-[10px] font-mono font-semibold text-[#908fa0] uppercase tracking-wider mb-1">Primary H3 Zone</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={form.primary_h3_zone}
                                    onChange={e => setForm(f => ({ ...f, primary_h3_zone: e.target.value }))}
                                    placeholder="Click pin to pick from map"
                                    readOnly
                                    className="flex-1 bg-[#0a0e17] border border-[#31353f] rounded px-2.5 py-1.5 text-xs text-white placeholder:text-[#505868] outline-none font-mono cursor-default"
                                />
                                <button
                                    onClick={activateHexPicker}
                                    title="Pick H3 zone from map"
                                    className={`shrink-0 px-2.5 py-1.5 rounded border text-xs transition-colors ${state.hexSelectionMode ? 'bg-indigo-500 border-indigo-400 text-white animate-pulse' : 'bg-[#0a0e17] border-[#31353f] text-[#908fa0] hover:border-indigo-500/60 hover:text-indigo-300'}`}
                                >
                                    <MapPin className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            {state.hexSelectionMode && (
                                <p className="text-[10px] text-indigo-400 mt-1 animate-pulse">
                                    Click a hexagon on the map to select it
                                </p>
                            )}
                            {form.primary_h3_zone && (
                                <p className="text-[10px] text-emerald-400 mt-1 font-mono">
                                    ✓ {form.primary_h3_zone}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Confirm Button */}
                    <button
                        onClick={confirmUser}
                        className="shrink-0 mt-4 w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded font-mono font-semibold text-sm transition-colors border border-indigo-500/50"
                    >
                        <Check className="w-4 h-4" />
                        Confirm & Add User
                    </button>
                </div>
            ) : (
                /* ── All Users List ── */
                <div className="flex-1 flex flex-col min-h-0">
                    <h3 className="text-sm font-semibold text-[#908fa0] uppercase tracking-wider mb-3 shrink-0">
                        All Users ({state.riders.length})
                    </h3>
                    <ul className="space-y-3 overflow-y-auto custom-scrollbar pr-2 flex-1 min-h-0">
                        {state.riders.map(rider => (
                            <li key={rider.id} className="flex flex-col p-3 bg-[#0a0e17] rounded-md border border-[#31353f]">
                                <div className="flex justify-between items-center mb-3">
                                    <div>
                                        <span className="font-semibold text-sm block">{rider.name}</span>
                                        {rider.zomatoId && <span className="text-[10px] text-[#908fa0] font-mono">{rider.zomatoId}</span>}
                                    </div>
                                    <span className={`w-2 h-2 rounded-full shadow-sm shrink-0 ${rider.status === 'ACTIVE' ? 'bg-green-500 shadow-green-500/50' : rider.status === 'DANGER' ? 'bg-red-500 shadow-red-500/50' : 'bg-gray-500'}`} />
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => dispatch({ type: 'TOGGLE_RIDER_STATUS', payload: { id: rider.id } })}
                                        className={`flex-1 text-xs py-1.5 rounded font-mono font-medium transition-colors ${rider.status === 'ACTIVE' ? 'bg-[#1f2937] text-[#908fa0] hover:bg-[#374151]' : 'bg-indigo-600 text-white hover:bg-indigo-500'}`}
                                    >
                                        {rider.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                                    </button>
                                    <button
                                        onClick={() => dispatch({ type: 'FOCUS_LOCATION', payload: { location: rider.location } })}
                                        className="flex-1 bg-[#1f2937] hover:bg-[#374151] text-[#dfe2ef] text-xs py-1.5 rounded font-mono font-medium transition-colors border border-[#31353f]"
                                    >
                                        Track
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
