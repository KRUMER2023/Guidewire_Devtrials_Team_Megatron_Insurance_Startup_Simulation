"use client";

import React, { useState, useEffect } from 'react';
import { Shield, Activity, MapPin, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock hook based on provided data
const useSimulation = () => {
  return {
    state: {
      riders: {
        "ZMT_4421": {
          id: "ZMT_4421",
          name: "Rahul Sharma",
          firstName: "Rahul",
          vehicle_class: "EV_YULU",
          status: "ACTIVE",
          trust_score: 87,
          h3_zone: "882816a03bfffff"
        }
      },
      hexagons: {
        "882816a03bfffff": {
          status: "SAFE"
        }
      }
    }
  };
};

export default function RiderDashboard() {
  const { state } = useSimulation();
  
  // Using explicit ID for the single rider view
  const rider = state.riders["ZMT_4421"];

  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ days: 14, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === 0 ? 1 : 0));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-full w-full flex flex-col md:flex-row bg-[#0a0e17] overflow-hidden min-h-screen">
      
      {/* 1. LEFT SIDEBAR (Desktop Only) */}
      <aside className="hidden md:flex w-20 lg:w-64 border-r border-[#31353f] bg-[#111827] flex-col py-6 lg:p-6 shadow-xl z-10 transition-all">
        <div className="flex items-center gap-3 mb-10 w-full">
          <div className="w-10 h-10 lg:w-8 lg:h-8 bg-[#6366f1] rounded flex items-center justify-center shadow-[0_0_10px_rgba(99,102,241,0.5)]">
            <Shield className="w-6 h-6 lg:w-5 lg:h-5 text-white" />
          </div>
          <span className="hidden lg:block font-bold text-lg text-[#c0c1ff] tracking-widest">GIGSHIELD</span>
        </div>

        <div className="flex items-center gap-3 mb-8 w-full">
          <div className="w-12 h-12 rounded-full border border-[#31353f] bg-[#1c1f29] flex items-center justify-center text-white font-bold">RS</div>
          <div className="hidden lg:block">
            <h2 className="text-white font-bold">{rider.name}</h2>
            <div className="text-[10px] text-[#22c55e] font-bold">{rider.status}</div>
          </div>
        </div>

        <nav className="flex-1 w-full space-y-2">
          {/* Navigation Items Map */}
          <button className="w-full flex items-center gap-3 p-3 lg:px-4 lg:py-3 rounded-lg text-sm font-medium bg-[#6366f1]/10 text-[#c0c1ff] border border-[#6366f1]/30">
            <Activity className="w-5 h-5" />
            <span className="hidden lg:block truncate">Dashboard</span>
          </button>
        </nav>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8 custom-scrollbar">

        {/* --- Header (Mobile) --- */}
        <div className="md:hidden mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full border-2 border-[#6366f1]/50 bg-gradient-to-br from-[#6366f1] to-[#a855f7] flex items-center justify-center text-white font-bold">
              RS
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{rider.name}</h2>
              <div className="flex gap-2">
                <span className="text-[10px] font-bold text-[#22c55e] border border-[#22c55e]/30 px-2 rounded-full bg-[#22c55e]/10">⚡ EV</span>
                <span className="text-[10px] text-[#22c55e] font-bold">Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* --- Header (Desktop) --- */}
        <header className="hidden md:flex flex-col md:flex-row md:justify-between md:items-end mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Welcome back, {rider.firstName} 👋</h1>
            <p className="text-sm text-[#908fa0] font-mono">Week 14 — Mar 25 to Mar 31, 2026</p>
          </div>
        </header>

        {/* --- Ad Carousel Banner --- */}
        <div className="rounded-2xl border border-[#6366f1]/30 overflow-hidden relative bg-[#111827] mb-5 md:mb-6 aspect-[2/1]">
          {/* Automatically rotating ad banner */}
          <div className="absolute inset-0 w-full h-full relative">
            <img 
              src="/ad-banner-1.png" 
              className={`absolute inset-0 object-cover w-full h-full transition-opacity duration-700 ${current === 0 ? 'opacity-100 z-10' : 'opacity-0 z-0'}`} 
              alt="Advertisement 1" 
            />
            <img 
              src="/ad-banner-2.png" 
              className={`absolute inset-0 object-cover w-full h-full transition-opacity duration-700 ${current === 1 ? 'opacity-100 z-10' : 'opacity-0 z-0'}`} 
              alt="Advertisement 2" 
            />
          </div>
          <div className="absolute bottom-3 left-1/2 flex gap-2 -translate-x-1/2 z-20">
             <button onClick={() => setCurrent(0)} className={`w-2.5 h-2.5 rounded-full transition-colors ${current === 0 ? 'bg-[#6366f1]' : 'bg-white/30'}`} />
             <button onClick={() => setCurrent(1)} className={`w-2.5 h-2.5 rounded-full transition-colors ${current === 1 ? 'bg-[#6366f1]' : 'bg-white/30'}`} />
          </div>
        </div>

        {/* --- Countdown Timer (Desktop Only here - Mobile uses fixed footer) --- */}
        <div className="hidden md:block rounded-2xl border border-[#6366f1]/40 bg-gradient-to-r from-[#6366f1]/10 via-[#111827] to-[#6366f1]/10 p-4 md:p-5 mb-6">
          <div className="text-[10px] md:text-xs font-bold text-[#c0c1ff] uppercase mb-3">Free Trial Remaining</div>
          <div className="flex justify-center gap-2 md:gap-3">
            <div className="flex flex-col items-center">
               <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl border border-[#31353f] bg-[#0a0e17] flex items-center justify-center text-xl md:text-2xl font-bold text-white shadow-lg">{timeLeft.days}</div>
               <span className="text-[8px] md:text-[9px] text-[#908fa0] mt-1 font-bold uppercase">Days</span>
            </div>
            <div className="flex flex-col items-center">
               <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl border border-[#31353f] bg-[#0a0e17] flex items-center justify-center text-xl md:text-2xl font-bold text-white shadow-lg">00</div>
               <span className="text-[8px] md:text-[9px] text-[#908fa0] mt-1 font-bold uppercase">Hours</span>
            </div>
            <div className="flex flex-col items-center">
               <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl border border-[#31353f] bg-[#0a0e17] flex items-center justify-center text-xl md:text-2xl font-bold text-white shadow-lg">00</div>
               <span className="text-[8px] md:text-[9px] text-[#908fa0] mt-1 font-bold uppercase">Mins</span>
            </div>
          </div>
        </div>


        {/* --- Section: AI Premium Predictor --- */}
        <div className="rounded-2xl border border-[#31353f] bg-[#111827]/60 p-4 md:p-6 mb-6 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#6366f1] to-transparent" />
           <div className="flex items-center gap-3 mb-4">
             <h2 className="text-[10px] font-bold text-[#908fa0] uppercase tracking-widest">AI Premium Predictor</h2>
             <span className="ml-auto text-[9px] text-[#908fa0] font-mono">Thu 10:00 AM</span>
           </div>
           <div className="text-4xl md:text-5xl font-bold text-white mb-4"><span className="text-xl text-[#6366f1]">₹</span>85</div>
           <div className="bg-[#0a0e17] border border-[#31353f] rounded-lg p-3 text-[10px] font-mono text-[#908fa0]">
             <div className="flex justify-between mb-1"><span>Base Risk Floor:</span> <span>₹100</span></div>
             <div className="flex justify-between text-[#22c55e]"><span>Discount:</span> <span>-15%</span></div>
           </div>
        </div>

        {/* --- Section: Premium Impact Breakdown --- */}
        <div className="rounded-2xl border border-[#31353f] bg-[#111827]/60 p-4 md:p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-[10px] border-[#908fa0] font-bold uppercase tracking-widest text-[#908fa0]">Premium Impact Breakdown</h2>
            <div className="text-[10px] font-bold px-2 py-1 bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30 rounded">+101.7%</div>
          </div>
          <div className="flex justify-between items-center px-4">
            <div>
              <div className="text-[9px] text-[#908fa0] uppercase mb-1">Total Paid</div>
              <div className="text-2xl md:text-3xl font-bold text-[#f97316]">₹1,190</div>
            </div>
            <div className="h-10 w-[1px] bg-[#31353f]" />
            <div className="text-right">
              <div className="text-[9px] text-[#908fa0] uppercase mb-1">Total Claims</div>
              <div className="text-2xl md:text-3xl font-bold text-[#22c55e]">₹2,400</div>
            </div>
          </div>
        </div>

        {/* --- Section: The Payout Vault --- */}
        <div className="rounded-2xl border border-[#31353f] bg-[#111827]/60 p-4 md:p-6 mb-6">
          <h2 className="text-[10px] md:text-xs font-bold text-[#908fa0] uppercase tracking-widest mb-6 border-b border-[#31353f] pb-3">The Payout Vault</h2>
          
          <div className="space-y-6 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-[2px] before:bg-[#31353f]">
             {/* Feed Items */}
             <div className="flex gap-4 relative">
                <div className="w-10 h-10 rounded-full bg-[#111827] border border-[#31353f] flex items-center justify-center shrink-0 z-10">
                   <CreditCard className="w-4 h-4 text-[#908fa0]" />
                </div>
                <div className="flex-1 mt-1">
                  <div className="flex justify-between">
                     <h4 className="text-xs md:text-sm font-bold text-white">Automated Claim: Flood</h4>
                     <span className="text-[8px] font-bold text-[#22c55e] border border-[#22c55e]/30 px-1.5 py-0.5 rounded bg-[#22c55e]/10 uppercase">Paid</span>
                  </div>
                  <div className="text-base text-[#22c55e]">+₹850</div>
                  <p className="text-[9px] text-[#908fa0] font-mono">10 Mar • Zero-Touch Settlement</p>
                </div>
             </div>
          </div>
        </div>

        {/* --- Section: Loyalty Trust Score --- */}
        <div className="rounded-2xl border border-[#31353f] bg-[#111827]/60 p-4 md:p-6 flex flex-col mb-6">
           <h2 className="text-[10px] md:text-xs font-bold text-[#908fa0] uppercase tracking-widest mb-4">Loyalty Trust Score</h2>
           <div className="flex items-center gap-4 md:gap-6">
             <div className="relative w-16 h-16 md:w-20 md:h-20 shrink-0">
               {/* Trust Arc SVG Placeholder */}
               <svg className="w-full h-full"><circle cx="50%" cy="50%" r="45%" stroke="#1c1f29" fill="none" strokeWidth="5"/></svg>
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <span className="text-xl md:text-2xl font-bold text-white">{rider.trust_score}</span>
                 <span className="text-[8px] text-[#908fa0] -mt-1 uppercase">Score</span>
               </div>
             </div>
             <div>
                <div className="inline-block text-[9px] font-bold px-2 py-1 rounded bg-[#f97316]/20 text-[#f97316] border border-[#f97316]/30 mb-2">TIER: GOLD</div>
                <p className="text-[10px] md:text-xs text-[#908fa0]">Maintain >80 for 3 more weeks to unlock discounts.</p>
             </div>
           </div>
        </div>

      </main>

      {/* 3. MOBILE FIXED BOTTOM TIMER NAV */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#111827]/95 backdrop-blur-lg border-t border-[#31353f] px-4 py-3">
        <div className="flex items-center justify-between gap-3">
           <div className="flex items-center gap-2">
             <span className="text-[9px] font-bold text-[#c0c1ff] uppercase tracking-widest">Trial</span>
           </div>
           
           {/* Compact Countdown View inside footer */}
           <div className="flex gap-2">
             <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-lg bg-[#0a0e17] border border-[#31353f] flex items-center justify-center text-sm font-bold text-white shadow-lg">{timeLeft.days}</div>
                <span className="text-[7px] text-[#908fa0] font-bold uppercase mt-0.5">Days</span>
             </div>
             <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-lg bg-[#0a0e17] border border-[#31353f] flex items-center justify-center text-sm font-bold text-white shadow-lg">00</div>
                <span className="text-[7px] text-[#908fa0] font-bold uppercase mt-0.5">Hrs</span>
             </div>
             <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-lg bg-[#0a0e17] border border-[#31353f] flex items-center justify-center text-sm font-bold text-white shadow-lg">00</div>
                <span className="text-[7px] text-[#908fa0] font-bold uppercase mt-0.5">Mins</span>
             </div>
           </div>

        </div>
      </div>
      
    </div>
  );
}
