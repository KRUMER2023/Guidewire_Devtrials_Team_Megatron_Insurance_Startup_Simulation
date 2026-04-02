"use client";

import React, { useState, useEffect } from 'react';
import { Shield, Activity, MapPin, CreditCard, LogOut, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function RiderDashboard() {
  const { user, stats, recentLogs, isLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ days: 14, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/gigshield/rider');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === 0 ? 1 : 0));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  if (isLoading || !user) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#0a0e17]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-[#6366f1] animate-spin" />
          <p className="text-[#908fa0] animate-pulse">Syncing with GigShield Matrix...</p>
        </div>
      </div>
    );
  }

  // Get first name from full name
  const firstName = user.name.split(' ')[0];

  return (
    <div className="h-full w-full flex flex-col md:flex-row bg-[#0a0e17] overflow-hidden min-h-screen">

      {/* 1. LEFT SIDEBAR (Desktop Only) */}
      <aside className="hidden md:flex w-20 lg:w-64 border-r border-[#31353f] bg-[#111827] flex-col py-6 lg:p-6 shadow-xl z-10 transition-all">
        <div className="flex items-center gap-3 mb-10 w-full">
          <div className="w-10 h-10 lg:w-8 lg:h-8 bg-[#6366f1] rounded flex items-center justify-center shadow-[0_0_10px_rgba(99,102,241,0.5)]">
            <Shield className="w-6 h-6 lg:w-5 lg:h-5 text-white" />
          </div>
          <span className="hidden lg:block font-bold text-lg text-[#c0c1ff] tracking-widest uppercase">GIGSHIELD</span>
        </div>

        <div className="flex items-center gap-3 mb-8 w-full">
          <div className="w-12 h-12 rounded-full border border-[#31353f] bg-[#1c1f29] flex items-center justify-center text-white font-bold uppercase">
            {user.name.substring(0, 2)}
          </div>
          <div className="hidden lg:block overflow-hidden">
            <h2 className="text-white font-bold truncate">{user.name}</h2>
            <div className="text-[10px] text-[#22c55e] font-bold">Online</div>
          </div>
        </div>

        <nav className="flex-1 w-full space-y-2">
          <button className="w-full flex items-center gap-3 p-3 lg:px-4 lg:py-3 rounded-lg text-sm font-medium bg-[#6366f1]/10 text-[#c0c1ff] border border-[#6366f1]/30">
            <Activity className="w-5 h-5" />
            <span className="hidden lg:block truncate">Dashboard</span>
          </button>
        </nav>

        <div className="mt-auto pt-4 border-t border-[#31353f]">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 p-3 lg:px-4 lg:py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors group"
          >
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="hidden lg:block truncate">Logout System</span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8 custom-scrollbar">

        {/* --- Header (Mobile) --- */}
        <div className="md:hidden mb-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full border-2 border-[#6366f1]/50 bg-gradient-to-br from-[#6366f1] to-[#a855f7] flex items-center justify-center text-white font-bold uppercase">
                {user.name.substring(0, 2)}
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{user.name}</h2>
                <div className="flex gap-2">
                  <span className="text-[10px] font-bold text-[#22c55e] border border-[#22c55e]/30 px-2 rounded-full bg-[#22c55e]/10 uppercase">⚡ {user.vehicle_type || 'N/A'}</span>
                  <span className="text-[10px] text-[#22c55e] font-bold">Online</span>
                </div>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-10 h-10 rounded-xl bg-[#1c1f29] border border-[#31353f] flex items-center justify-center text-red-400 active:scale-95 transition-all"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* --- Header (Desktop) --- */}
        <header className="hidden md:flex flex-col md:flex-row md:justify-between md:items-end mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Welcome back, {firstName} 👋</h1>
            <p className="text-sm text-[#908fa0] font-mono">Session Active: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">

            {/* --- Ad Carousel Banner --- */}
            <div className="rounded-2xl border border-[#6366f1]/30 overflow-hidden relative bg-[#111827] aspect-[2.4/1]">
              <div className="absolute inset-0 w-full h-full">
                <div className={`absolute inset-0 transition-opacity duration-700 bg-gradient-to-r from-[#6366f1] to-[#a855f7] ${current === 0 ? 'opacity-100' : 'opacity-0'}`}>
                  <div className="p-8 flex flex-col justify-center h-full">
                    <span className="text-white text-xs font-bold uppercase tracking-widest mb-2">New Protection Plan</span>
                    <h3 className="text-2xl font-black text-white max-w-xs leading-tight">Monsoon Shield Active Now!</h3>
                  </div>
                </div>
                <div className={`absolute inset-0 transition-opacity duration-700 bg-gradient-to-r from-[#f97316] to-[#ec4899] ${current === 1 ? 'opacity-100' : 'opacity-0'}`}>
                  <div className="p-8 flex flex-col justify-center h-full">
                    <span className="text-white text-xs font-bold uppercase tracking-widest mb-2">Earnings Bonus</span>
                    <h3 className="text-2xl font-black text-white max-w-xs leading-tight">10 Safe Trips = ₹500 Bonus</h3>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-3 left-8 flex gap-2 z-20">
                <button onClick={() => setCurrent(0)} className={`w-2.5 h-2.5 rounded-full transition-colors ${current === 0 ? 'bg-white' : 'bg-white/30'}`} />
                <button onClick={() => setCurrent(1)} className={`w-2.5 h-2.5 rounded-full transition-colors ${current === 1 ? 'bg-white' : 'bg-white/30'}`} />
              </div>
            </div>

            {/* --- Section: AI Premium Predictor --- */}
            <div className="rounded-2xl border border-[#31353f] bg-[#111827]/60 p-4 md:p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#6366f1] to-transparent" />
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-[10px] font-bold text-[#908fa0] uppercase tracking-widest">AI Premium Predictor</h2>
                <span className="ml-auto text-[9px] text-[#908fa0] font-mono">Current Market Risk</span>
              </div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-4"><span className="text-xl text-[#6366f1]">₹</span>{stats?.current_premium || 0}</div>
              <div className="bg-[#0a0e17] border border-[#31353f] rounded-xl p-4 text-[11px] font-mono text-[#908fa0]">
                <div className="flex justify-between mb-2"><span>Base Risk Floor:</span> <span>₹100.00</span></div>
                <div className="flex justify-between text-[#22c55e]">
                  <span>Trust Score Discount ({stats?.trust_score}%):</span>
                  <span>-₹{(100 - (stats?.current_premium || 100)).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* --- Section: The Payout Vault (Real logs) --- */}
            <div className="rounded-2xl border border-[#31353f] bg-[#111827]/60 p-4 md:p-6 mb-6">
              <h2 className="text-[10px] md:text-xs font-bold text-[#908fa0] uppercase tracking-widest mb-6 border-b border-[#31353f] pb-3">The Payout Vault</h2>

              <div className="space-y-6 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-[2px] before:bg-[#31353f]">
                {recentLogs.length > 0 ? recentLogs.map((log, idx) => (
                  <div key={idx} className="flex gap-4 relative">
                    <div className="w-10 h-10 rounded-full bg-[#111827] border border-[#31353f] flex items-center justify-center shrink-0 z-10">
                      <CreditCard className="w-4 h-4 text-[#908fa0]" />
                    </div>
                    <div className="flex-1 mt-1">
                      <div className="flex justify-between">
                        <h4 className="text-xs md:text-sm font-bold text-white">{log.event_type.replace(/_/g, ' ')}</h4>
                        <span className="text-[8px] font-bold text-[#22c55e] border border-[#22c55e]/30 px-1.5 py-0.5 rounded bg-[#22c55e]/10 uppercase">Success</span>
                      </div>
                      <div className="text-base text-[#22c55e]">{log.amount > 0 ? `+₹${log.amount}` : `₹${log.amount}`}</div>
                      <p className="text-[9px] text-[#908fa0] font-mono">{new Date(log.timestamp).toLocaleDateString()} • {log.h3_index || 'System Event'}</p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-6">
                    <p className="text-xs text-[#4b5563]">No recent payouts in vault.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* --- Countdown Timer (Always visible) --- */}
            <div className="rounded-2xl border border-[#6366f1]/40 bg-gradient-to-br from-[#111827] to-[#0a0e17] p-5 shadow-2xl">
              <div className="text-[10px] font-bold text-[#c0c1ff] uppercase mb-4 tracking-tighter">Trial Period Ends In</div>
              <div className="flex justify-between gap-2">
                {[
                  { value: timeLeft.days, label: 'Days' },
                  { value: '00', label: 'Hrs' },
                  { value: '00', label: 'Mins' }
                ].map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center">
                    <div className="w-full aspect-square rounded-xl border border-[#31353f] bg-[#0a0e17] flex items-center justify-center text-2xl font-black text-white shadow-inner">
                      {item.value}
                    </div>
                    <span className="text-[9px] text-[#908fa0] mt-2 font-bold uppercase tracking-widest">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* --- Section: Loyalty Trust Score --- */}
            <div className="rounded-2xl border border-[#31353f] bg-[#111827]/60 p-4 md:p-6 flex flex-col">
              <h2 className="text-[10px] md:text-xs font-bold text-[#908fa0] uppercase tracking-widest mb-6">Loyalty Trust Score</h2>
              <div className="flex flex-col items-center gap-6">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="50%" cy="50%" r="40%" stroke="#1c1f29" fill="none" strokeWidth="8" />
                    <circle
                      cx="50%"
                      cy="50%"
                      r="40%"
                      stroke="#6366f1"
                      fill="none"
                      strokeWidth="8"
                      strokeDasharray="251"
                      strokeDashoffset={251 - (251 * (stats?.trust_score || 0)) / 100}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-black text-white">{stats?.trust_score || 0}</span>
                    <span className="text-[10px] text-[#908fa0] uppercase font-bold tracking-tight">Units</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="inline-block text-[10px] font-bold px-3 py-1 rounded-full bg-[#f97316]/20 text-[#f97316] border border-[#f97316]/30 mb-3 uppercase tracking-widest">
                    Tier: {(stats?.trust_score || 0) > 90 ? 'Platinum' : (stats?.trust_score || 0) > 80 ? 'Gold' : 'Silver'}
                  </div>
                  <p className="text-[11px] text-[#908fa0] leading-relaxed">
                    Your high trust score is currently saving you <span className="text-white font-bold">15%</span> on daily premiums.
                  </p>
                </div>
              </div>
            </div>

            {/* --- Section: Premium Impact Breakdown --- */}
            <div className="rounded-2xl border border-[#31353f] bg-[#111827]/60 p-4 md:p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-[#908fa0]">Payout Summary</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="text-[9px] text-[#908fa0] uppercase mb-1 font-bold">Current Exposure</div>
                  <div className="text-3xl font-black text-[#f97316]">₹{stats?.current_premium || 0} / day</div>
                </div>
                <div className="h-[1px] w-full bg-[#31353f]" />
                <div>
                  <div className="text-[9px] text-[#908fa0] uppercase mb-1 font-bold">Total Payouts Received</div>
                  <div className="text-3xl font-black text-[#22c55e]">₹{stats?.total_payouts || 0}</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* 3. MOBILE FIXED BOTTOM TIMER NAV (Optional overlay) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#111827]/95 backdrop-blur-xl border-t border-[#31353f] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[8px] font-bold text-[#c0c1ff] uppercase tracking-widest mb-1">Protection Phase</span>
            <span className="text-sm font-black text-white uppercase">Free Trial</span>
          </div>

          <div className="flex gap-2">
            <div className="bg-[#0a0e17] px-3 py-1.5 rounded-lg border border-[#31353f] flex flex-col items-center">
              <span className="text-xs font-bold text-white">{timeLeft.days}d</span>
              <span className="text-[6px] text-[#908fa0] font-bold uppercase">Left</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
