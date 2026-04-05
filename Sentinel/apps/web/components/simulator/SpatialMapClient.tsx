"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useSimulation, HARDCODED_PATH } from '../../context/SimulationContext';
import * as h3 from 'h3-js';

declare global {
    interface Window { mappls: any; }
}

const PICKER_RES = 10; // Resolution 10 = ~150m hexagons


export default function SpatialMapClient() {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const polygonsRef = useRef<Record<string, any>>({});
    const ridersRef = useRef<any>({});
    // Hex search highlight polygon
    const hexHighlightPolyRef = useRef<any>(null);
    // Hover preview polygon (follows mouse)
    const hoverPolyRef = useRef<any>(null);
    const hoverCellRef = useRef<string | null>(null);
    // Locked selection polygon (red, persists until form exits)
    const selectedPolyRef = useRef<any>(null);
    // Map listener refs for cleanup
    const mouseMoveHandlerRef = useRef<((e: any) => void) | null>(null);
    const clickHandlerRef = useRef<((e: any) => void) | null>(null);
    const selectionMarkerRef = useRef<any>(null); // Still used for multi-select or transient
    const pickupMarkerRef = useRef<any>(null);
    const deliveryMarkerRef = useRef<any>(null);
    const trackingRiderRef = useRef<any>(null);
    const trackingLineRef = useRef<any>(null);
    const trackingPickupPinRef = useRef<any>(null);
    const trackingDeliveryPinRef = useRef<any>(null);

    const { state, dispatch } = useSimulation();
    const [mapLoaded, setMapLoaded] = useState(false);

    // ── Persistent Selection Pins (Pickup/Delivery) ───────────────────
    useEffect(() => {
        if (!mapLoaded || !window.mappls || !mapInstanceRef.current) return;

        // Sync Pickup Marker
        if (state.pickupPin) {
            if (!pickupMarkerRef.current) {
                pickupMarkerRef.current = new window.mappls.Marker({
                    map: mapInstanceRef.current,
                    position: { lat: state.pickupPin[0], lng: state.pickupPin[1] },
                    html: `<div style="width:24px;height:24px;background:#10b981;border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 0 10px rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:100;">
                             <div style="width:8px;height:8px;background:white;border-radius:50%;transform:rotate(45deg);margin:auto;"></div>
                           </div>`
                });
            } else {
                pickupMarkerRef.current.setPosition?.({ lat: state.pickupPin[0], lng: state.pickupPin[1] });
            }
        } else {
            removeLayer(pickupMarkerRef.current); pickupMarkerRef.current = null;
        }

        // Sync Delivery Marker
        if (state.deliveryPin) {
            if (!deliveryMarkerRef.current) {
                deliveryMarkerRef.current = new window.mappls.Marker({
                    map: mapInstanceRef.current,
                    position: { lat: state.deliveryPin[0], lng: state.deliveryPin[1] },
                    html: `<div style="width:24px;height:24px;background:#f43f5e;border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 0 10px rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:100;">
                             <div style="width:8px;height:8px;background:white;border-radius:50%;transform:rotate(45deg);margin:auto;"></div>
                           </div>`
                });
            } else {
                deliveryMarkerRef.current.setPosition?.({ lat: state.deliveryPin[0], lng: state.deliveryPin[1] });
            }
        } else {
            removeLayer(deliveryMarkerRef.current); deliveryMarkerRef.current = null;
        }
    }, [state.pickupPin, state.deliveryPin, mapLoaded]);

    // ── Helpers ──────────────────────────────────────────────────────
    const removeLayer = (poly: any) => {
        if (!poly) return;
        try { window.mappls.remove({ map: mapInstanceRef.current, layer: poly }); } catch { }
    };

    const addHexPoly = (cellId: string, color: string, fillOpacity: number, strokeOpacity: number, strokeWeight: number) => {
        try {
            const boundary = h3.cellToBoundary(cellId);
            const path = boundary.map((p: any) => ({ lat: p[0], lng: p[1] }));
            return new window.mappls.Polygon({
                map: mapInstanceRef.current,
                paths: path,
                fillColor: color,
                fillOpacity,
                strokeColor: color,
                strokeOpacity,
                strokeWeight,
                fitbounds: false,
            });
        } catch { return null; }
    };

    const extractLatLng = (e: any): [number, number] | null => {
        try {
            if (e?.lngLat?.lat != null) return [e.lngLat.lat, e.lngLat.lng];
            if (e?.latLng?.lat != null) return [e.latLng.lat, e.latLng.lng];
            if (e?.lat != null) return [e.lat, e.lng];
        } catch { }
        return null;
    };

    // ── Initialize Map ──────────────────────────────────────────────
    useEffect(() => {
        const initMap = () => {
            if (!window.mappls || !mapContainerRef.current || mapInstanceRef.current) return;
            const map = new window.mappls.Map(mapContainerRef.current, {
                center: [22.273575, 73.160189],
                zoom: 13,
                layer: 'vector',
                zoomControl: true,
                location: true,
            });
            mapInstanceRef.current = map;
            const onLoad = () => setMapLoaded(true);
            if (typeof map.addListener === 'function') map.addListener('load', onLoad);
            else if (typeof map.on === 'function') map.on('load', onLoad);
            else setTimeout(onLoad, 1500);
        };
        const id = setInterval(() => {
            if (window.mappls && !mapInstanceRef.current) { initMap(); clearInterval(id); }
        }, 500);
        return () => clearInterval(id);
    }, []);

    // ── Hardcoded Order Tracking Visualization ───────────────────────
    useEffect(() => {
        if (!mapLoaded || !window.mappls || !mapInstanceRef.current) return;

        if (state.activeTracking) {
            const coords = HARDCODED_PATH[state.trackingIndex];
            const remainingPath = HARDCODED_PATH.slice(state.trackingIndex).map(p => ({ lat: p[0], lng: p[1] }));

            // Update Rider Pin (Red Droplet)
            if (!trackingRiderRef.current) {
                trackingRiderRef.current = new window.mappls.Marker({
                    map: mapInstanceRef.current,
                    position: { lat: coords[0], lng: coords[1] },
                    html: `<div style="width:30px;height:30px;background:#ef4444;border:2px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 0 10px rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:200;">
                             <div style="width:10px;height:10px;background:white;border-radius:50%;transform:rotate(45deg);margin:auto;"></div>
                           </div>`
                });
            } else {
                try { trackingRiderRef.current.setPosition?.({ lat: coords[0], lng: coords[1] }); } catch { }
            }

            // Update Blue Polyline (Shortens as rider moves)
            removeLayer(trackingLineRef.current);
            if (remainingPath.length > 1) {
                try {
                    trackingLineRef.current = new window.mappls.Polyline({
                        map: mapInstanceRef.current,
                        paths: remainingPath,
                        strokeColor: '#3b82f6',
                        strokeOpacity: 0.8,
                        strokeWeight: 7,
                        fitbounds: false
                    });
                } catch { trackingLineRef.current = null; }
            } else {
                trackingLineRef.current = null;
            }

            // --- Checkpoint Pins (Droplets) ---

            // Pickup Pin (Yellow) - Show if trackingIndex < 5
            if (state.trackingIndex < 5) {
                const pPos = HARDCODED_PATH[5];
                if (!trackingPickupPinRef.current) {
                    trackingPickupPinRef.current = new window.mappls.Marker({
                        map: mapInstanceRef.current,
                        position: { lat: pPos[0], lng: pPos[1] },
                        html: `<div style="width:26px;height:26px;background:#fbbf24;border:2px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 0 10px rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:150;">
                                 <div style="width:8px;height:8px;background:white;border-radius:50%;transform:rotate(45deg);margin:auto;"></div>
                               </div>`
                    });
                }
            } else {
                removeLayer(trackingPickupPinRef.current); trackingPickupPinRef.current = null;
            }

            // Delivery Pin (Green) - Show if trackingIndex < 15
            if (state.trackingIndex < 15) {
                const dPos = HARDCODED_PATH[15];
                if (!trackingDeliveryPinRef.current) {
                    trackingDeliveryPinRef.current = new window.mappls.Marker({
                        map: mapInstanceRef.current,
                        position: { lat: dPos[0], lng: dPos[1] },
                        html: `<div style="width:26px;height:26px;background:#10b981;border:2px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 0 10px rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:150;">
                                 <div style="width:8px;height:8px;background:white;border-radius:50%;transform:rotate(45deg);margin:auto;"></div>
                               </div>`
                    });
                }
            } else {
                removeLayer(trackingDeliveryPinRef.current); trackingDeliveryPinRef.current = null;
            }

            // Optional: Auto-pan to follow rider
            if (state.trackingIndex % 3 === 0) {
                mapInstanceRef.current.setCenter?.({ lat: coords[0], lng: coords[1] });
            }

        } else {
            // Cleanup when tracking ends
            if (trackingRiderRef.current) { removeLayer(trackingRiderRef.current); trackingRiderRef.current = null; }
            if (trackingLineRef.current) { removeLayer(trackingLineRef.current); trackingLineRef.current = null; }
            if (trackingPickupPinRef.current) { removeLayer(trackingPickupPinRef.current); trackingPickupPinRef.current = null; }
            if (trackingDeliveryPinRef.current) { removeLayer(trackingDeliveryPinRef.current); trackingDeliveryPinRef.current = null; }
        }
    }, [state.activeTracking, state.trackingIndex, mapLoaded]);

    // ── Hazard Hexagons ──────────────────────────────────────────────
    useEffect(() => {
        if (!mapLoaded || !window.mappls || !mapInstanceRef.current) return;
        const current = Object.keys(state.hexagons);
        Object.keys(polygonsRef.current).forEach(id => {
            if (!current.includes(id)) { removeLayer(polygonsRef.current[id]); delete polygonsRef.current[id]; }
        });
        current.forEach(id => {
            if (!polygonsRef.current[id]) {
                const color = state.hexagons[id] === 'RED' ? '#ef4444' : '#f97316';
                polygonsRef.current[id] = addHexPoly(id, color, 0.4, 0.8, 2);
            }
        });
    }, [state.hexagons, mapLoaded]);

    // ── Rider Dots ───────────────────────────────────────────────────
    useEffect(() => {
        if (!mapLoaded || !window.mappls || !mapInstanceRef.current) return;
        const activeIds = state.riders.filter(r => r.status !== 'IDLE').map(r => r.id);
        Object.keys(ridersRef.current).forEach(id => {
            if (!activeIds.includes(id)) { removeLayer(ridersRef.current[id]); delete ridersRef.current[id]; }
        });
        state.riders.filter(r => r.status !== 'IDLE').forEach(rider => {
            if (!ridersRef.current[rider.id]) {
                ridersRef.current[rider.id] = new window.mappls.Marker({
                    map: mapInstanceRef.current,
                    position: { lat: rider.location[0], lng: rider.location[1] },
                    html: `<div style="width:14px;height:14px;background:#6366f1;border:2px solid white;border-radius:50%;box-shadow:0 0 4px rgba(0,0,0,0.5);"></div>`
                });
            } else {
                try { ridersRef.current[rider.id].setPosition?.({ lat: rider.location[0], lng: rider.location[1] }); } catch { }
            }
        });
    }, [state.riders, mapLoaded]);

    // ── Hex Search Highlight ──────────────────────────────────────────
    useEffect(() => {
        if (!mapLoaded || !window.mappls || !mapInstanceRef.current) return;
        // Remove old highlight
        removeLayer(hexHighlightPolyRef.current);
        hexHighlightPolyRef.current = null;
        if (!state.highlightedHex) return;
        // Draw new light-blue highlight at 50% opacity
        hexHighlightPolyRef.current = addHexPoly(
            state.highlightedHex,
            '#38bdf8', // sky-400
            0.5,        // fillOpacity 50%
            0.9,        // strokeOpacity
            2.5
        );
    }, [state.highlightedHex, mapLoaded]);

    useEffect(() => {
        if (!mapLoaded || !window.mappls || !mapInstanceRef.current || !state.focusLocation) return;
        const map = mapInstanceRef.current;
        const [lat, lng] = state.focusLocation.coords;
        const ZOOM = 17;
        try {
            // Mappls GL style
            if (typeof map.easeTo === 'function') {
                map.easeTo({ center: [lng, lat], zoom: ZOOM, duration: 1200 });
                // Mapbox GL style
            } else if (typeof map.flyTo === 'function') {
                map.flyTo({ center: [lng, lat], zoom: ZOOM, speed: 1.4, curve: 1.4 });
                // Mappls REST style
            } else if (typeof map.setCenterZoom === 'function') {
                map.setCenterZoom({ lat, lng }, ZOOM);
                // Last resort
            } else {
                map.setCenter?.({ lat, lng });
                map.setZoom?.(ZOOM);
            }
        } catch (e) { console.warn('Map recentering failed:', e); }
    }, [state.focusLocation, mapLoaded]);

    // ── Multi-Hex Hazard Selection Highlight ─────────────────────────
    const hazardSelectionPolysRef = useRef<Record<string, any>>({});
    useEffect(() => {
        if (!mapLoaded || !window.mappls || !mapInstanceRef.current) return;
        const current = state.pendingHazardHexes;
        Object.keys(hazardSelectionPolysRef.current).forEach(id => {
            if (!current.includes(id)) { removeLayer(hazardSelectionPolysRef.current[id]); delete hazardSelectionPolysRef.current[id]; }
        });
        current.forEach(id => {
            if (!hazardSelectionPolysRef.current[id]) {
                hazardSelectionPolysRef.current[id] = addHexPoly(id, '#22c55e', 0.5, 1, 2.5);
            }
        });
    }, [state.pendingHazardHexes, mapLoaded]);

    // ── Hex Picker Mode ──────────────────────────────────────────────
    useEffect(() => {
        if (!mapLoaded || !window.mappls || !mapInstanceRef.current) return;
        const map = mapInstanceRef.current;

        const addListener = (evt: string, fn: (e: any) => void) => {
            if (typeof map.addListener === 'function') map.addListener(evt, fn);
            else if (typeof map.on === 'function') map.on(evt, fn);
        };
        const removeListener = (evt: string, fn: (e: any) => void) => {
            try {
                if (typeof map.removeListener === 'function') map.removeListener(evt, fn);
                else if (typeof map.off === 'function') map.off(evt, fn);
            } catch { }
        };

        const cleanup = () => {
            if (mouseMoveHandlerRef.current) { removeListener('mousemove', mouseMoveHandlerRef.current); mouseMoveHandlerRef.current = null; }
            if (clickHandlerRef.current) { removeListener('click', clickHandlerRef.current); clickHandlerRef.current = null; }
            removeLayer(hoverPolyRef.current); hoverPolyRef.current = null; hoverCellRef.current = null;
            removeLayer(selectedPolyRef.current); selectedPolyRef.current = null;
            if (selectionMarkerRef.current) { removeLayer(selectionMarkerRef.current); selectionMarkerRef.current = null; }
        };

        if (!state.hexSelectionMode) {
            cleanup();
            return;
        }

        // Mousemove: show a transient indigo hex under cursor
        const onMouseMove = (e: any) => {
            const coords = extractLatLng(e);
            if (!coords) return;
            const [lat, lng] = coords;
            const cellId = h3.latLngToCell(lat, lng, PICKER_RES);

            if (hoverCellRef.current === cellId) return;
            hoverCellRef.current = cellId;

            removeLayer(hoverPolyRef.current);
            hoverPolyRef.current = addHexPoly(cellId, '#818cf8', 0.25, 0.85, 1.5);
        };

        const onClick = (e: any) => {
            const coords = extractLatLng(e);
            if (!coords) return;
            const [lat, lng] = coords;
            const cellId = h3.latLngToCell(lat, lng, PICKER_RES);

            if (state.hexSelectionType === 'HAZARD') {
                dispatch({ type: 'TOGGLE_HAZARD_HEX', payload: { cellId } });
            } else {
                removeLayer(hoverPolyRef.current); hoverPolyRef.current = null; hoverCellRef.current = null;
                removeLayer(selectedPolyRef.current);

                // Color-matched highlight
                const color = state.hexSelectionType === 'PICKUP' ? '#10b981' : '#f43f5e';
                selectedPolyRef.current = addHexPoly(cellId, color, 0.4, 0.9, 2);

                dispatch({ type: 'SELECT_H3_ZONE', payload: { cellId, lat, lng } });
            }
        };

        mouseMoveHandlerRef.current = onMouseMove;
        clickHandlerRef.current = onClick;
        addListener('mousemove', onMouseMove);
        addListener('click', onClick);

        return cleanup;
    }, [state.hexSelectionMode, state.hexSelectionType, mapLoaded, dispatch]);

    // ── Render ───────────────────────────────────────────────────────
    return (
        <div className="w-full h-full relative">
            <div id="mappls-container" ref={mapContainerRef} className="w-full h-full" style={{ background: '#0a0e17' }} />

            {state.hexSelectionMode && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-[#1e1b4b]/90 backdrop-blur-md text-indigo-200 text-xs font-mono px-5 py-2.5 rounded-full border border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.35)] pointer-events-none select-none">
                    {state.hexSelectionType === 'HAZARD'
                        ? '⛓ MULTI-SELECT MODE · Click hexes to toggle · Form updates live'
                        : '🗺 SINGLE-SELECT MODE · Click to lock zone'}
                </div>
            )}

            {!mapLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#0a0e17]/80 backdrop-blur-sm z-10">
                    <div className="text-indigo-400 animate-pulse font-mono flex flex-col items-center">
                        <span className="mb-2">INITIALIZING SPATIAL MATRIX...</span>
                        <div className="w-48 h-1 bg-[#1f2937] overflow-hidden rounded-full">
                            <div className="h-full bg-indigo-500 w-1/2 animate-bounce"></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
