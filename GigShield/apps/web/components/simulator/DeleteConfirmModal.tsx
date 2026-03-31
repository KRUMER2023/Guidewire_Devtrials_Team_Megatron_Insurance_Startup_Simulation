"use client";

import React from 'react';
import { X, Trash2, AlertTriangle, Loader2 } from 'lucide-react';

interface DeleteConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    isDeleting?: boolean;
}

export default function DeleteConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    isDeleting = false
}: DeleteConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#030712]/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-sm bg-[#111827] border border-[#31353f] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-4 border-b border-[#31353f] flex items-center justify-between bg-red-500/5">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-red-500/10 rounded-lg border border-red-500/20">
                            <AlertTriangle className="w-4 h-4 text-red-400" />
                        </div>
                        <span className="text-sm font-semibold text-white uppercase tracking-wider">{title}</span>
                    </div>
                    <button onClick={onClose} className="text-[#908fa0] hover:text-white transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <p className="text-xs text-[#908fa0] font-mono leading-relaxed text-center">
                        {description}
                    </p>
                    <div className="mt-4 flex flex-col gap-2">
                        <div className="p-2.5 bg-red-500/5 border border-red-500/10 rounded-lg text-[10px] text-red-300 font-mono text-center">
                            ⚠️ This action will permanently remove the record from the database.
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-[#0a0e17] border-t border-[#31353f] flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="flex-1 px-4 py-2 text-xs font-mono font-semibold text-[#908fa0] hover:text-white hover:bg-[#1f2937] rounded-lg border border-[#31353f] transition-all disabled:opacity-50"
                    >
                        CANCEL
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-xs font-mono font-semibold text-white bg-red-600 hover:bg-red-500 rounded-lg border border-red-500/50 transition-all shadow-lg shadow-red-500/20 disabled:opacity-50"
                    >
                        {isDeleting ? (
                            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> PURGING…</>
                        ) : (
                            <><Trash2 className="w-3.5 h-3.5" /> CONFIRM</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
