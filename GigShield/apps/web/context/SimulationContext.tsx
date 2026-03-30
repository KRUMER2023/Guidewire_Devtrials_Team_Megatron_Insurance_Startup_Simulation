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
    hexSelectionMode: boolean;    // true = map shows wireframe hex picker
    pendingH3Zone: string | null; // H3 cell ID clicked in picker mode
    highlightedHex: string | null; // H3 cell highlighted by the hex search bar
}

const initialState: SimulationState = {
    riders: [],
    isLoadingRiders: true,
    hexagons: {},
    events: [],
    logs: [{ id: '1', level: 'info', message: 'System Initialized - God Mode Active', timestamp: '2024-01-01T00:00:00.000Z' }],
    fundBalance: 15420000,
    hexSelectionMode: false,
    pendingH3Zone: null,
    highlightedHex: null,
};

type Action =
    | { type: 'TRIGGER_DISASTER'; payload: { hexIds: string[]; intensity: HexagonStatus; location: [number, number] } }
    | { type: 'CLEAR_DISASTER' }
    | { type: 'ADD_LOG'; payload: { level: 'info' | 'warn' | 'error'; message: string } }
    | { type: 'TOGGLE_RIDER_STATUS'; payload: { id: string } }
    | { type: 'FOCUS_LOCATION'; payload: { location: [number, number] } }
    | { type: 'ENABLE_HEX_SELECTION' }
    | { type: 'DISABLE_HEX_SELECTION' }
    | { type: 'SELECT_H3_ZONE'; payload: { cellId: string } }
    | { type: 'ADD_RIDER'; payload: Rider }
    | { type: 'SET_RIDERS'; payload: Rider[] }
    | { type: 'HIGHLIGHT_HEX'; payload: { cellId: string } }
    | { type: 'CLEAR_HEX_HIGHLIGHT' };

function simulationReducer(state: SimulationState, action: Action): SimulationState {
    switch (action.type) {
        case 'TRIGGER_DISASTER': {
            const newHexagons = { ...state.hexagons };
            action.payload.hexIds.forEach(id => { newHexagons[id] = action.payload.intensity; });
            return {
                ...state,
                hexagons: newHexagons,
                events: [...state.events, { id: Date.now().toString(), type: 'HAZARD', intensity: action.payload.intensity, timestamp: new Date().toISOString(), location: action.payload.location }],
                logs: [{ id: Date.now().toString(), level: 'warn', message: `Hazard intensity ${action.payload.intensity} triggered at [${action.payload.location[0].toFixed(4)}, ${action.payload.location[1].toFixed(4)}]`, timestamp: new Date().toISOString() }, ...state.logs]
            };
        }
        case 'CLEAR_DISASTER':
            return { ...state, hexagons: {}, logs: [{ id: Date.now().toString(), level: 'info', message: 'All hazards cleared.', timestamp: new Date().toISOString() }, ...state.logs] };
        case 'ADD_LOG':
            return { ...state, logs: [{ id: Date.now().toString(), level: action.payload.level, message: action.payload.message, timestamp: new Date().toISOString() }, ...state.logs] };
        case 'TOGGLE_RIDER_STATUS':
            return {
                ...state,
                riders: state.riders.map(r => r.id === action.payload.id ? { ...r, status: r.status === 'ACTIVE' ? 'IDLE' : 'ACTIVE' } : r),
                logs: [{ id: Date.now().toString(), level: 'info', message: `Rider ${action.payload.id} status toggled.`, timestamp: new Date().toISOString() }, ...state.logs]
            };
        case 'FOCUS_LOCATION':
            return { ...state, focusLocation: { coords: action.payload.location, v: Date.now() } };
        case 'ENABLE_HEX_SELECTION':
            return { ...state, hexSelectionMode: true, pendingH3Zone: null };
        case 'DISABLE_HEX_SELECTION':
            return { ...state, hexSelectionMode: false, pendingH3Zone: null };
        case 'SELECT_H3_ZONE':
            return { ...state, pendingH3Zone: action.payload.cellId, hexSelectionMode: false };
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
                logs: [{ id: Date.now().toString(), level: 'info', message: `New rider registered: ${action.payload.name} (${action.payload.zomatoId})`, timestamp: new Date().toISOString() }, ...state.logs]
            };
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
