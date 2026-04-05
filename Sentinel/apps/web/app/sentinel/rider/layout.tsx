"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function RiderLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user, isAuthenticated, logout } = useAuth();

    const userId = searchParams.get('user') || user?.id;

    const handleLogout = async () => {
        await logout();
        router.push('/sentinel/rider/login');
    };

    return (
        <div className="bg-surface text-on-surface font-body selection:bg-primary selection:text-on-primary min-h-screen flex flex-col">
            {/* 
        STRICT REPLICATION OF PROVIDED TAILWIND CONFIG AND STYLES
      */}
            <style jsx global>{`
        :root {
          --on-surface: #eeeef0;
          --surface: #0c0e10;
          --primary: #ff8d8f;
          --secondary: #ff6c91;
          --tertiary: #fffadf;
        }

        .crimson-velocity {
          background: linear-gradient(135deg, #ff8d8f 0%, #bc004f 100%);
        }
        .glass-panel {
          backdrop-filter: blur(20px);
          background: rgba(35, 38, 41, 0.4);
        }
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        body {
          min-height: max(884px, 100dvh);
          background-color: #0c0e10;
          color: #eeeef0;
          font-family: 'Manrope', sans-serif;
        }
        .font-headline { font-family: 'Epilogue', sans-serif; }
      `}</style>

            <link href="https://fonts.googleapis.com/css2?family=Epilogue:wght@400;700;800;900&family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet" />
            <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />

            {/* TopAppBar - STRICT HTML */}
            <nav className="bg-stone-950/40 backdrop-blur-2xl docked full-width top-0 sticky z-50 flex justify-between items-center w-full px-6 h-16 no-border shadow-[0_8px_32px_rgba(78,0,13,0.15)]">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-rose-400" data-icon="shield">shield</span>
                    <span className="font-epilogue font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-pink-600 text-2xl">Sentinel</span>
                </div>
                <div className="hidden md:flex items-center gap-8">
                    <Link className={`${pathname.includes('homepage') || pathname === '/sentinel/rider' ? 'text-rose-400 font-bold' : 'text-stone-400'} font-epilogue text-lg tracking-tight hover:bg-rose-500/10 transition-colors px-3 py-1 rounded-lg`} href={`/sentinel/rider/homepage${userId ? `?user=${userId}` : ''}`}>Home</Link>
                    <Link className={`${pathname.includes('shield') ? 'text-rose-400 font-bold' : 'text-stone-400'} font-epilogue text-lg tracking-tight hover:bg-rose-500/10 transition-colors px-3 py-1 rounded-lg`} href={`/sentinel/rider/shield${userId ? `?user=${userId}` : ''}`}>Shield</Link>
                    <Link className={`${pathname.includes('earnings') ? 'text-rose-400 font-bold' : 'text-stone-400'} font-epilogue text-lg tracking-tight hover:bg-rose-500/10 transition-colors px-3 py-1 rounded-lg`} href={`/sentinel/rider/earnings${userId ? `?user=${userId}` : ''}`}>Earnings</Link>
                </div>
                {isAuthenticated ? (
                    <button onClick={handleLogout} className="bg-gradient-to-br from-rose-500 to-pink-700 text-white font-bold px-6 py-2 rounded-xl active:scale-95 duration-200">Logout</button>
                ) : (
                    <Link href="/sentinel/rider/login">
                        <button className="bg-gradient-to-br from-rose-500 to-pink-700 text-white font-bold px-6 py-2 rounded-xl active:scale-95 duration-200">Login</button>
                    </Link>
                )}
            </nav>

            <main className="flex-1">
                {children}
            </main>

            {/* Footer (Desktop) */}
            <footer className="bg-stone-950 w-full py-12 px-6 mt-auto border-t border-stone-800/50 hidden md:block">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 max-w-7xl mx-auto">
                    <div className="flex flex-col items-center md:items-start gap-4">
                        <span className="font-epilogue font-bold text-rose-500 text-2xl tracking-tight">Sentinel</span>
                        <p className="font-manrope text-sm text-stone-400">© 2026 Sentinel. Officially partnered with Zomato.</p>
                    </div>
                    <div className="flex gap-8">
                        <Link className="font-manrope text-sm text-stone-400 hover:text-rose-400 transition-colors opacity-80 hover:opacity-100" href="#">Coverage</Link>
                        <Link className="font-manrope text-sm text-stone-400 hover:text-rose-400 transition-colors opacity-80 hover:opacity-100" href="#">Pricing</Link>
                        <Link className="font-manrope text-sm text-stone-400 hover:text-rose-400 transition-colors opacity-80 hover:opacity-100" href="#">Support</Link>
                    </div>
                </div>
            </footer>

            {/* BottomNavBar (Mobile Only) - STRICT HTML */}
            <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-3 bg-stone-950/60 backdrop-blur-3xl rounded-t-[32px] shadow-[0_-8px_24px_rgba(78,0,13,0.2)]">
                <Link href={`/sentinel/rider/homepage${userId ? `?user=${userId}` : ''}`} className="flex flex-col items-center justify-center relative">
                    <div className={`${pathname.includes('homepage') || pathname === '/sentinel/rider' ? 'bg-gradient-to-br from-rose-500 to-pink-700 text-white rounded-2xl px-5 py-2 scale-110 -translate-y-1 shadow-lg shadow-rose-900/40' : 'text-stone-500 py-2'} flex flex-col items-center transition-all duration-300`}>
                        <span className="material-symbols-outlined" data-icon="home">home</span>
                        <span className="font-manrope text-[11px] font-semibold uppercase tracking-wider mt-1">Home</span>
                    </div>
                </Link>
                <Link href={`/sentinel/rider/shield${userId ? `?user=${userId}` : ''}`} className="flex flex-col items-center justify-center relative">
                    <div className={`${pathname.includes('shield') ? 'bg-gradient-to-br from-rose-500 to-pink-700 text-white rounded-2xl px-5 py-2 scale-110 -translate-y-1 shadow-lg shadow-rose-900/40' : 'text-stone-500 py-2'} flex flex-col items-center transition-all duration-300`}>
                        <span className="material-symbols-outlined" data-icon="verified_user">verified_user</span>
                        <span className="font-manrope text-[11px] font-semibold uppercase tracking-wider mt-1">Shield</span>
                    </div>
                </Link>
                <Link href={`/sentinel/rider/earnings${userId ? `?user=${userId}` : ''}`} className="flex flex-col items-center justify-center relative">
                    <div className={`${pathname.includes('earnings') ? 'bg-gradient-to-br from-rose-500 to-pink-700 text-white rounded-2xl px-5 py-2 scale-110 -translate-y-1 shadow-lg shadow-rose-900/40' : 'text-stone-500 py-2'} flex flex-col items-center transition-all duration-300`}>
                        <span className="material-symbols-outlined" data-icon="payments">payments</span>
                        <span className="font-manrope text-[11px] font-semibold uppercase tracking-wider mt-1">Earnings</span>
                    </div>
                </Link>
                <Link href={`/sentinel/rider/account${userId ? `?user=${userId}` : ''}`} className="flex flex-col items-center justify-center relative">
                    <div className={`${pathname.includes('account') ? 'bg-gradient-to-br from-rose-500 to-pink-700 text-white rounded-2xl px-5 py-2 scale-110 -translate-y-1 shadow-lg shadow-rose-900/40' : 'text-stone-500 py-2'} flex flex-col items-center transition-all duration-300`}>
                        <span className="material-symbols-outlined" data-icon="person">person</span>
                        <span className="font-manrope text-[11px] font-semibold uppercase tracking-wider mt-1">Account</span>
                    </div>
                </Link>
            </nav>
        </div>
    );
}
