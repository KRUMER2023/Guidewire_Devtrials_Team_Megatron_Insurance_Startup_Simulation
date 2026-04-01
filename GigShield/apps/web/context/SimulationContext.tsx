"use client";

import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Define the state shape
export type HexagonStatus = 'SAFE' | 'ORANGE' | 'RED';

export interface Rider {
    id: string;
    name: string;
    age?: number;
    zomatoId?: string;
    vehicleType?: string;
    trustScore?: number;
    location: [number, number]; // [lat, lng]
    status: 'ACTIVE' | 'IDLE' | 'DANGER' | 'SAFE';
    primaryH3Zone?: string | null;
}

export interface DbHazard {
    id: string;
    hazard_type: string;
    hex_index: string[]; // Changed to string array
    confidence_score: number;
    severity: number;
    is_active: boolean;
    created_at: string;
}

export interface SimulationEvent {
    id: string;
    type: string;
    intensity: string;
    timestamp: string;
    location: [number, number];
}

export interface SimulationLog {
    id: string;
    level: 'info' | 'warn' | 'error';
    message: string;
    timestamp: string;
}

export interface SimulationState {
    riders: Rider[];
    isLoadingRiders: boolean;
    hexagons: Record<string, HexagonStatus>; // H3 index -> Status
    events: SimulationEvent[];
    logs: SimulationLog[];
    fundBalance: number;
    focusLocation?: { coords: [number, number]; v: number } | null;
    hexSelectionMode: boolean;
    hexSelectionType: 'RIDER' | 'HAZARD' | 'PICKUP' | 'DELIVERY';
    pendingH3Zone: string | null;
    pendingLat: number | null;
    pendingLng: number | null;
    pendingHazardHexes: string[]; // New state for multiple hex selection
    highlightedHex: string | null;
    dbHazards: DbHazard[];
}

const initialState: SimulationState = {
    riders: [],
    isLoadingRiders: true,
    hexagons: {},
    events: [],
    logs: [{ id: '1', level: 'info', message: 'System Initialized - God Mode Active', timestamp: '2024-01-01T00:00:00.000Z' }],
    fundBalance: 15420000,
    hexSelectionMode: false,
    hexSelectionType: 'RIDER',
    pendingH3Zone: null,
    pendingLat: null,
    pendingLng: null,
    pendingHazardHexes: [],
    highlightedHex: null,
    dbHazards: [],
};

type Action =
    | { type: 'TRIGGER_DISASTER'; payload: { hexIds: string[]; intensity: HexagonStatus; location: [number, number] } }
    | { type: 'CLEAR_DISASTER' }
    | { type: 'ADD_LOG'; payload: { level: 'info' | 'warn' | 'error'; message: string } }
    | { type: 'TOGGLE_RIDER_STATUS'; payload: { id: string } }
    | { type: 'FOCUS_LOCATION'; payload: { location: [number, number] } }
    | { type: 'ENABLE_HEX_SELECTION'; payload?: { type: 'RIDER' | 'HAZARD' | 'PICKUP' | 'DELIVERY' } }
    | { type: 'DISABLE_HEX_SELECTION' }
    | { type: 'SELECT_H3_ZONE'; payload: { cellId: string; lat: number; lng: number } }
    | { type: 'TOGGLE_HAZARD_HEX'; payload: { cellId: string } } // New action for multi-select
    | { type: 'CLEAR_PENDING_HAZARDS' }
    | { type: 'ADD_RIDER'; payload: Rider }
    | { type: 'SET_RIDERS'; payload: Rider[] }
    | { type: 'HIGHLIGHT_HEX'; payload: { cellId: string } }
    | { type: 'CLEAR_HEX_HIGHLIGHT' }
    | { type: 'SET_DB_HAZARDS'; payload: DbHazard[] }
    | { type: 'ADD_DB_HAZARD'; payload: DbHazard }
    | { type: 'REMOVE_DB_HAZARD'; payload: { id: string } }
    | { type: 'TOGGLE_DB_HAZARD'; payload: { id: string; is_active: boolean } }
    | { type: 'REMOVE_RIDER'; payload: { id: string } };

function buildHexagons(hazards: DbHazard[]): Record<string, HexagonStatus> {
    const map: Record<string, HexagonStatus> = {};
    hazards.filter(h => h.is_active).forEach(h => {
        h.hex_index.forEach(hex => {
            map[hex] = h.severity >= 7 ? 'RED' : 'ORANGE';
        });
    });
    return map;
}

function simulationReducer(state: SimulationState, action: Action): SimulationState {
    switch (action.type) {
        case 'REMOVE_RIDER':
            return {
                ...state,
                riders: state.riders.filter(r => r.id !== action.payload.id),
                logs: [{ id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, level: 'info', message: `Rider ${action.payload.id.slice(0, 8)} removed from matrix.`, timestamp: new Date().toISOString() }, ...state.logs]
            };
        case 'TRIGGER_DISASTER': {
            const newHexagons = { ...state.hexagons };
            action.payload.hexIds.forEach(id => { newHexagons[id] = action.payload.intensity; });
            return {
                ...state,
                hexagons: newHexagons,
                events: [...state.events, { id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, type: 'HAZARD', intensity: action.payload.intensity, timestamp: new Date().toISOString(), location: action.payload.location }],
                logs: [{ id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, level: 'warn', message: `Hazard intensity ${action.payload.intensity} triggered at [${action.payload.location[0].toFixed(4)}, ${action.payload.location[1].toFixed(4)}]`, timestamp: new Date().toISOString() }, ...state.logs]
            };
        }
        case 'CLEAR_DISASTER':
            return { ...state, hexagons: buildHexagons(state.dbHazards), logs: [{ id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, level: 'info', message: 'Manual hazards cleared.', timestamp: new Date().toISOString() }, ...state.logs] };
        case 'ADD_LOG':
            return { ...state, logs: [{ id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, level: action.payload.level, message: action.payload.message, timestamp: new Date().toISOString() }, ...state.logs] };
        case 'TOGGLE_RIDER_STATUS':
            return {
                ...state,
                riders: state.riders.map(r => r.id === action.payload.id ? { ...r, status: r.status === 'ACTIVE' ? 'IDLE' : 'ACTIVE' } : r),
                logs: [{ id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, level: 'info', message: `Rider ${action.payload.id} status toggled.`, timestamp: new Date().toISOString() }, ...state.logs]
            };
        case 'FOCUS_LOCATION':
            return { ...state, focusLocation: { coords: action.payload.location, v: Date.now() } };
        case 'ENABLE_HEX_SELECTION':
            return {
                ...state,
                hexSelectionMode: true,
                hexSelectionType: action.payload?.type || 'RIDER',
                pendingH3Zone: null,
                pendingHazardHexes: action.payload?.type === 'HAZARD' ? [] : state.pendingHazardHexes
            };
        case 'DISABLE_HEX_SELECTION':
            return { ...state, hexSelectionMode: false, pendingH3Zone: null, pendingLat: null, pendingLng: null, pendingHazardHexes: [] };
        case 'SELECT_H3_ZONE':
            return { ...state, pendingH3Zone: action.payload.cellId, pendingLat: action.payload.lat, pendingLng: action.payload.lng, hexSelectionMode: false };
        case 'TOGGLE_HAZARD_HEX': {
            const current = state.pendingHazardHexes;
            const updated = current.includes(action.payload.cellId)
                ? current.filter(h => h !== action.payload.cellId)
                : [...current, action.payload.cellId];
            return { ...state, pendingHazardHexes: updated };
        }
        case 'CLEAR_PENDING_HAZARDS':
            return { ...state, pendingHazardHexes: [] };
        case 'HIGHLIGHT_HEX':
            return { ...state, highlightedHex: action.payload.cellId };
        case 'CLEAR_HEX_HIGHLIGHT':
            return { ...state, highlightedHex: null };
        case 'SET_RIDERS':
            return { ...state, riders: action.payload, isLoadingRiders: false };
        case 'ADD_RIDER':
            return {
                ...state,
                riders: [...state.riders, action.payload],
                logs: [{ id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, level: 'info', message: `New rider registered: ${action.payload.name} (${action.payload.zomatoId})`, timestamp: new Date().toISOString() }, ...state.logs]
            };
        case 'SET_DB_HAZARDS': {
            return {
                ...state,
                dbHazards: action.payload,
                hexagons: { ...buildHexagons(action.payload) },
            };
        }
        case 'ADD_DB_HAZARD': {
            const updated = [action.payload, ...state.dbHazards];
            return {
                ...state,
                dbHazards: updated,
                hexagons: { ...buildHexagons(updated) },
                logs: [{ id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, level: 'warn', message: `Hazard created: ${action.payload.hazard_type} at ${action.payload.hex_index.join(', ')}`, timestamp: new Date().toISOString() }, ...state.logs],
            };
        }
        case 'TOGGLE_DB_HAZARD': {
            const updated = state.dbHazards.map(h =>
                h.id === action.payload.id ? { ...h, is_active: action.payload.is_active } : h
            );
            return {
                ...state,
                dbHazards: updated,
                hexagons: { ...buildHexagons(updated) },
                logs: [{ id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, level: 'info', message: `Hazard ${action.payload.id.slice(0, 8)} is now ${action.payload.is_active ? 'ACTIVE' : 'INACTIVE'}.`, timestamp: new Date().toISOString() }, ...state.logs],
            };
        }
        case 'REMOVE_DB_HAZARD': {
            const updated = state.dbHazards.filter(h => h.id !== action.payload.id);
            return {
                ...state,
                dbHazards: updated,
                hexagons: { ...buildHexagons(updated) },
                logs: [{ id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, level: 'info', message: `Hazard ${action.payload.id.slice(0, 8)} permanently purged.`, timestamp: new Date().toISOString() }, ...state.logs],
            };
        }
        default:
            return state;
    }
}

const SimulationContext = createContext<{
    state: SimulationState;
    dispatch: React.Dispatch<Action>;
}>({ state: initialState, dispatch: () => null });

export function SimulationProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(simulationReducer, initialState);
    return (
        <SimulationContext.Provider value={{ state, dispatch }}>
            {children}
        </SimulationContext.Provider>
    );
}

export const useSimulation = () => useContext(SimulationContext);
