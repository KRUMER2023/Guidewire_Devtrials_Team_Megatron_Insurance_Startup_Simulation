"use client";

import React, { useState, useEffect } from 'react';
import { useSimulation, HARDCODED_PATH } from '../../context/SimulationContext';
import { MapPin, Box, Save, AlertCircle, User, Check, Loader2, Plus, List, ArrowLeft, Send, Trash2 } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

interface Order {
    ord_id: string;
    order_name: string;
    zom_id: string;
    pickup_latitude: number;
    pickup_longitude: number;
    delivery_latitude: number;
    delivery_longitude: number;
    created_at: string;
}

interface RouteResponse {
    routes: Array<{
        geometry: {
            coordinates: [number, number][];
        };
        duration: number;
        distance: number;
    }>;
}

interface OrderForm {
    order_name: string;
    zom_id: string;
    pickup_latitude: string;
    pickup_longitude: string;
    pickup_h3: string;
    delivery_latitude: string;
    delivery_longitude: string;
    delivery_h3: string;
}

const emptyForm: OrderForm = {
    order_name: 'FOOD_DELIVERY',
    zom_id: '',
    pickup_latitude: '',
    pickup_longitude: '',
    pickup_h3: '',
    delivery_latitude: '',
    delivery_longitude: '',
    delivery_h3: '',
};

export default function OrderAssigner() {
    const { state, dispatch } = useSimulation();
    const [view, setView] = useState<'tracker' | 'create' | 'track'>('tracker');
    const [orders, setOrders] = useState<Order[]>([]);
    const [form, setForm] = useState<OrderForm>(emptyForm);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);


    // Initial load
    useEffect(() => {
        loadOrders();
    }, []);

    async function loadOrders() {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/v1/orders/`);
            if (!res.ok) throw new Error("Failed to load orders");
            const data = await res.json();
            setOrders(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }

    // Sync map selection into the form
    useEffect(() => {
        if (state.pendingH3Zone && view === 'create') {
            if (state.hexSelectionType === 'PICKUP') {
                setForm(f => ({
                    ...f,
                    pickup_h3: state.pendingH3Zone!,
                    pickup_latitude: state.pendingLat ? state.pendingLat.toFixed(6) : f.pickup_latitude,
                    pickup_longitude: state.pendingLng ? state.pendingLng.toFixed(6) : f.pickup_longitude,
                }));
            } else if (state.hexSelectionType === 'DELIVERY') {
                setForm(f => ({
                    ...f,
                    delivery_h3: state.pendingH3Zone!,
                    delivery_latitude: state.pendingLat ? state.pendingLat.toFixed(6) : f.delivery_latitude,
                    delivery_longitude: state.pendingLng ? state.pendingLng.toFixed(6) : f.delivery_longitude,
                }));
            }
        }
    }, [state.pendingH3Zone, state.pendingLat, state.pendingLng, state.hexSelectionType, view]);

    const activatePicker = (type: 'PICKUP' | 'DELIVERY') => {
        dispatch({ type: 'ENABLE_HEX_SELECTION', payload: { type } });
    };

    const handleSaveOrder = async () => {
        if (!form.zom_id || !form.pickup_latitude || !form.delivery_latitude) {
            setError("All fields including map vectors are required.");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const res = await fetch(`${API_BASE}/api/v1/orders/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    order_name: form.order_name,
                    zom_id: form.zom_id,
                    pickup_latitude: parseFloat(form.pickup_latitude),
                    pickup_longitude: parseFloat(form.pickup_longitude),
                    delivery_latitude: parseFloat(form.delivery_latitude),
                    delivery_longitude: parseFloat(form.delivery_longitude)
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || "Failed to save order");
            }

            dispatch({ type: 'ADD_LOG', payload: { level: 'info', message: `Order Persistent: ${form.order_name} for ${form.zom_id}` } });

            // Success flow
            setForm(emptyForm);
            dispatch({ type: 'CLEAR_SELECTION_PINS' });
            loadOrders();
            setView('tracker');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteOrder = async (ord_id: string, name: string) => {
        if (!confirm(`Permanently delete Order: ${name}?`)) return;

        try {
            const res = await fetch(`${API_BASE}/api/v1/orders/${ord_id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error("Failed to delete mission");

            dispatch({ type: 'ADD_LOG', payload: { level: 'warn', message: `Mission Offline: ${name} terminated.` } });
            loadOrders();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleStartOrder = (order: Order) => {
        const rider = state.riders.find((r: any) => r.zomatoId === order.zom_id);
        const riderName = rider ? rider.name : 'Unknown Rider';
        dispatch({ type: 'ADD_LOG', payload: { level: 'info', message: `🚀 Order Active: "${order.order_name}" tracking started for ${riderName}.` } });
        dispatch({ type: 'START_TRACKING', payload: { order } });
    };

    // Simulation Loop for active tracking
    useEffect(() => {
        if (!state.activeTracking) return;

        const interval = setInterval(() => {
            // Check for pickup pause (Index 5 is pickup)
            if (state.trackingIndex === 5) {
                // To avoid multiple interval fires while pausing, we don't increment here.
                // Instead, we just wait for the timeout below to push it to index 6.
                return;
            }

            if (state.trackingIndex < HARDCODED_PATH.length - 1) {
                const nextIndex = state.trackingIndex + 1;
                dispatch({ type: 'UPDATE_TRACK_INDEX', payload: nextIndex });

                // If we just reached pickup, set a timeout to "resume" after 4s (as requested)
                if (nextIndex === 5) {
                    // Stay at 5 for 4 seconds
                    setTimeout(() => {
                        dispatch({ type: 'UPDATE_TRACK_INDEX', payload: 6 });
                    }, 4000);
                }
            } else {
                // Delivery reached (Index 15)
                dispatch({ type: 'ADD_LOG', payload: { level: 'info', message: `✅ Order Delivered! Process Complete.` } });
                dispatch({ type: 'STOP_TRACKING' });
                clearInterval(interval);
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [state.activeTracking, state.trackingIndex, dispatch]);



    const renderTracker = () => (
        <div className="flex-1 flex flex-col min-h-0">
            <div className="grid grid-cols-1 gap-3 overflow-y-auto custom-scrollbar pr-1 pb-4">
                {orders.length === 0 && !isLoading && (
                    <div className="text-center py-12 border border-dashed border-[#31353f] rounded-xl bg-[#111827]/50">
                        <List className="w-8 h-8 text-[#31353f] mx-auto mb-3" />
                        <p className="text-xs text-[#505868] font-mono italic">No active orders tracked</p>
                    </div>
                )}

                {isLoading && (
                    <div className="flex items-center justify-center py-10 text-indigo-400">
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        <span className="text-xs font-mono">Scanning Network...</span>
                    </div>
                )}

                {orders.map((order) => (
                    <div key={order.ord_id} className="group bg-[#111827] border border-[#31353f] hover:border-indigo-500/40 rounded-xl p-3 transition-all duration-300 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                            <Trash2
                                onClick={(e) => { e.stopPropagation(); handleDeleteOrder(order.ord_id, order.order_name); }}
                                className="w-3.5 h-3.5 text-rose-500/60 hover:text-rose-500 cursor-pointer"
                            />
                        </div>

                        <div className="flex items-start gap-3 relative z-10">
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-inner">
                                <Box className="w-4 h-4 text-indigo-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-xs font-bold text-white truncate uppercase tracking-tight">{order.order_name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] text-[#908fa0] font-mono flex items-center gap-1">
                                        <User className="w-3 h-3" /> {order.zom_id}
                                    </span>
                                    <span className="w-1 h-1 rounded-full bg-[#31353f]"></span>
                                    <span className="text-[9px] text-[#505868] font-mono">{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-[#31353f]/50 flex items-center justify-between">
                            <div className="flex gap-2">
                                <div className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/5 text-emerald-400 border border-emerald-500/10 flex items-center gap-1">
                                    <MapPin className="w-2.5 h-2.5" /> Start
                                </div>
                                <div className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-500/5 text-rose-400 border border-rose-500/10 flex items-center gap-1">
                                    <MapPin className="w-2.5 h-2.5" /> End
                                </div>
                            </div>
                            <button
                                onClick={() => handleStartOrder(order)}
                                className="text-[10px] font-bold text-white flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 border border-indigo-500/50 rounded-md transition-all shadow-lg shadow-indigo-500/20"
                            >
                                <Send className="w-3 h-3" /> START
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderTrackOrder = () => null;

    const renderCreate = () => (
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1">
            <div className="bg-[#111827] border border-indigo-500/20 rounded-xl p-4 space-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2">
                    <button onClick={() => setView('tracker')} className="text-[#505868] hover:text-white">
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                </div>

                {/* Basic Info */}
                <div className="space-y-3 pt-2">
                    <div>
                        <label className="block text-[10px] font-mono font-semibold text-[#908fa0] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                            <Box className="w-3 h-3 text-indigo-400" /> Order Name
                        </label>
                        <input
                            type="text"
                            value={form.order_name}
                            onChange={e => setForm(f => ({ ...f, order_name: e.target.value }))}
                            placeholder="e.g. FOOD_DELIVERY"
                            className="w-full bg-[#0a0e17] border border-[#31353f] rounded px-3 py-2 text-xs text-white outline-none focus:border-indigo-500/60 font-mono transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-mono font-semibold text-[#908fa0] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                            <User className="w-3 h-3 text-indigo-400" /> Assigned Rider
                        </label>
                        <input
                            type="text"
                            value={form.zom_id}
                            onChange={e => setForm(f => ({ ...f, zom_id: e.target.value }))}
                            placeholder="ZOM-VAD-XXX"
                            className="w-full bg-[#0a0e17] border border-[#31353f] rounded px-3 py-2 text-xs text-white outline-none focus:border-indigo-500/60 font-mono transition-all uppercase"
                        />
                    </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-[#31353f] to-transparent my-1"></div>

                {/* Pickup Point */}
                <div className="space-y-2.5">
                    <div className="flex items-center justify-between leading-none">
                        <label className="block text-[10px] font-mono font-semibold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                            <MapPin className="w-3 h-3" /> Pickup Origin
                        </label>
                        {form.pickup_h3 && <span className="text-[9px] font-mono text-[#505868]">{form.pickup_h3}</span>}
                    </div>

                    <button
                        onClick={() => activatePicker('PICKUP')}
                        className={`w-full flex items-center justify-center gap-2 py-2 rounded border text-xs font-mono transition-all ${state.hexSelectionMode && state.hexSelectionType === 'PICKUP' ? 'bg-emerald-500 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-[#0a0e17] border-[#31353f] text-[#908fa0] hover:border-emerald-500/60 hover:text-emerald-300'}`}
                    >
                        {state.hexSelectionMode && state.hexSelectionType === 'PICKUP' ? 'SELECTING ON MAP...' : form.pickup_latitude ? 'VECTOR LOCKED' : 'LOCATE PICKUP'}
                    </button>

                    <div className="bg-[#0a0e17] border border-[#31353f] rounded px-3 py-2 opacity-90 focus-within:border-emerald-500/50 transition-all">
                        <p className="text-[8px] text-[#505868] uppercase mb-1 font-mono">Coordinates (LAT, LNG)</p>
                        <input
                            type="text"
                            value={form.pickup_latitude && form.pickup_longitude ? `${form.pickup_latitude}, ${form.pickup_longitude}` : ''}
                            onChange={(e) => {
                                const val = e.target.value;
                                const parts = val.split(',');
                                setForm(f => ({
                                    ...f,
                                    pickup_latitude: parts[0]?.trim() || '',
                                    pickup_longitude: parts[1]?.trim() || ''
                                }));
                            }}
                            placeholder="28.xxxxxx, 77.xxxxxx"
                            className="w-full bg-transparent text-[11px] font-mono text-white outline-none placeholder:text-[#31353f]"
                        />
                    </div>
                </div>

                {/* Delivery Point */}
                <div className="space-y-2.5">
                    <div className="flex items-center justify-between leading-none">
                        <label className="block text-[10px] font-mono font-semibold text-rose-400 uppercase tracking-widest flex items-center gap-1.5">
                            <MapPin className="w-3 h-3" /> Delivery Target
                        </label>
                        {form.delivery_h3 && <span className="text-[9px] font-mono text-[#505868]">{form.delivery_h3}</span>}
                    </div>

                    <button
                        onClick={() => activatePicker('DELIVERY')}
                        className={`w-full flex items-center justify-center gap-2 py-2 rounded border text-xs font-mono transition-all ${state.hexSelectionMode && state.hexSelectionType === 'DELIVERY' ? 'bg-rose-500 border-rose-400 text-white shadow-[0_0_15px_rgba(244,63,94,0.3)]' : 'bg-[#0a0e17] border-[#31353f] text-[#908fa0] hover:border-rose-500/60 hover:text-rose-300'}`}
                    >
                        {state.hexSelectionMode && state.hexSelectionType === 'DELIVERY' ? 'SELECTING ON MAP...' : form.delivery_latitude ? 'VECTOR LOCKED' : 'LOCATE DELIVERY'}
                    </button>

                    <div className="bg-[#0a0e17] border border-[#31353f] rounded px-3 py-2 opacity-90 focus-within:border-rose-500/50 transition-all">
                        <p className="text-[8px] text-[#505868] uppercase mb-1 font-mono">Coordinates (LAT, LNG)</p>
                        <input
                            type="text"
                            value={form.delivery_latitude && form.delivery_longitude ? `${form.delivery_latitude}, ${form.delivery_longitude}` : ''}
                            onChange={(e) => {
                                const val = e.target.value;
                                const parts = val.split(',');
                                setForm(f => ({
                                    ...f,
                                    delivery_latitude: parts[0]?.trim() || '',
                                    delivery_longitude: parts[1]?.trim() || ''
                                }));
                            }}
                            placeholder="28.xxxxxx, 77.xxxxxx"
                            className="w-full bg-transparent text-[11px] font-mono text-white outline-none placeholder:text-[#31353f]"
                        />
                    </div>
                </div>

                {error && (
                    <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded p-2.5 animate-in shake duration-300">
                        <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-red-400 font-mono">{error}</p>
                    </div>
                )}

                <div className="pt-2">
                    <button
                        onClick={handleSaveOrder}
                        disabled={isSubmitting}
                        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded font-mono font-bold text-xs uppercase tracking-widest transition-all ${success
                            ? 'bg-emerald-500 text-white border-emerald-400'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500/50 shadow-lg shadow-indigo-500/20'
                            }`}
                    >
                        {isSubmitting ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Persisting…</>
                        ) : success ? (
                            <><Check className="w-4 h-4" /> Vector Saved</>
                        ) : (
                            <><Save className="w-4 h-4" /> Save Order Vector</>
                        )}
                    </button>
                    <button
                        onClick={() => { setView('tracker'); setForm(emptyForm); dispatch({ type: 'CLEAR_SELECTION_PINS' }); }}
                        className="w-full mt-2 py-1.5 text-[10px] font-mono text-[#505868] hover:text-white transition-colors"
                    >
                        CANCEL
                    </button>
                </div>
            </div>
        </div>
    );

    const renderContent = () => {
        if (view === 'create') return renderCreate();
        if (view === 'track') return renderTrackOrder();
        return renderTracker();
    };

    return (
        <div className="h-full flex flex-col p-4 bg-[#0a0e17] border-l border-[#31353f] border-t overflow-hidden">
            <div className="flex items-center justify-between mb-4 shrink-0 px-1">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-4 bg-indigo-500 rounded-full"></div>
                    <h2 className="text-sm font-bold text-white uppercase tracking-widest">
                        {view === 'tracker' ? 'Order Dispatch' : 'New Order'}
                    </h2>
                </div>
                {view === 'tracker' && (
                    <button
                        onClick={() => setView('create')}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white p-1.5 rounded-lg transition-all shadow-lg shadow-indigo-500/20 border border-indigo-400/30"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-hidden flex flex-col">
                {renderContent()}
            </div>

        </div>
    );
}
