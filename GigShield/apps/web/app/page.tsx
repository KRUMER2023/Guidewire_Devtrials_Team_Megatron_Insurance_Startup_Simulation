
import Link from "next/link";
import { Truck, Activity, LayoutDashboard, Settings, Server, ChevronRight } from "lucide-react";

export default function Home() {
    return (
        <main className="relative min-h-screen bg-[#09090b] text-zinc-50 flex flex-col items-center justify-center font-sans overflow-hidden">
            {/* Ambient Background Gradient - Bottom to Top Light Pink Fill */}
            <div className="absolute inset-0 z-0 bg-gradient-to-t from-pink-500/10 via-[#09090b]/60 to-[#09090b] pointer-events-none" />

            {/* Soft glowing orb at the bottom */}
            <div className="absolute -bottom-[30%] left-1/2 -translate-x-1/2 w-[80%] h-[50%] bg-pink-600/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="relative z-10 w-full max-w-4xl px-6 py-12 flex flex-col items-center">
                <div className="mb-12 text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-400">
                        GigShield Hub
                    </h1>
                    <p className="text-zinc-400 text-lg max-w-sm mx-auto">
                        Quick Access to all the service running in our system.
                    </p>
                </div>

                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                    {/* Left Column: Web Applications */}
                    <div className="flex flex-col gap-4">
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-2 mb-1">Web Applications</span>

                        <Link href="/gigshield/rider" className="group relative flex items-center justify-between p-4 bg-zinc-900/40 hover:bg-zinc-800/60 backdrop-blur-xl border border-zinc-800/50 hover:border-pink-500/30 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-pink-500/5 active:scale-[0.98]">
                            <div className="flex items-center gap-4">
                                <div className="bg-pink-500/10 p-3 rounded-xl group-hover:bg-pink-500/20 text-pink-400 transition-colors">
                                    <Truck className="w-5 h-5" />
                                </div>
                                <div className="flex flex-col text-left">
                                    <span className="text-lg font-semibold text-zinc-200 group-hover:text-white transition-colors">
                                        Rider Dashboard
                                    </span>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-pink-400 group-hover:translate-x-1 transition-all" />
                        </Link>

                        <Link href="/gigshield/simulator" className="group relative flex items-center justify-between p-4 bg-zinc-900/40 hover:bg-zinc-800/60 backdrop-blur-xl border border-zinc-800/50 hover:border-pink-500/30 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-pink-500/5 active:scale-[0.98]">
                            <div className="flex items-center gap-4">
                                <div className="bg-pink-500/10 p-3 rounded-xl group-hover:bg-pink-500/20 text-pink-400 transition-colors">
                                    <Activity className="w-5 h-5" />
                                </div>
                                <div className="flex flex-col text-left">
                                    <span className="text-lg font-semibold text-zinc-200 group-hover:text-white transition-colors">
                                        Simulator Interface
                                    </span>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-pink-400 group-hover:translate-x-1 transition-all" />
                        </Link>

                        {/* <Link href="/gigshield/master-dashboard" className="group relative flex items-center justify-between p-4 bg-zinc-900/40 hover:bg-zinc-800/60 backdrop-blur-xl border border-zinc-800/50 hover:border-pink-500/30 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-pink-500/5 active:scale-[0.98]">
                            <div className="flex items-center gap-4">
                                <div className="bg-pink-500/10 p-3 rounded-xl group-hover:bg-pink-500/20 text-pink-400 transition-colors">
                                    <LayoutDashboard className="w-5 h-5" />
                                </div>
                                <div className="flex flex-col text-left">
                                    <span className="text-lg font-semibold text-zinc-200 group-hover:text-white transition-colors">
                                        Master Dashboard
                                    </span>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-pink-400 group-hover:translate-x-1 transition-all" />
                        </Link> */}
                    </div>

                    {/* Right Column: Infrastructure Services */}
                    <div className="flex flex-col gap-4">
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-2 mb-1">Infrastructure</span>

                        <a href="http://localhost:5678" target="_blank" rel="noopener noreferrer" className="group relative flex items-center justify-between p-4 bg-zinc-900/40 hover:bg-zinc-800/60 backdrop-blur-xl border border-zinc-800/50 hover:border-pink-500/30 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-pink-500/5 active:scale-[0.98]">
                            <div className="flex items-center gap-4">
                                <div className="bg-pink-500/10 p-3 rounded-xl group-hover:bg-pink-500/20 text-pink-400 transition-colors">
                                    <Settings className="w-5 h-5" />
                                </div>
                                <div className="flex flex-col text-left">
                                    <span className="text-lg font-semibold text-zinc-200 group-hover:text-white transition-colors">
                                        n8n Automation Server
                                    </span>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-pink-400 group-hover:translate-x-1 transition-all" />
                        </a>

                        <a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer" className="group relative flex items-center justify-between p-4 bg-zinc-900/40 hover:bg-zinc-800/60 backdrop-blur-xl border border-zinc-800/50 hover:border-pink-500/30 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-pink-500/5 active:scale-[0.98]">
                            <div className="flex items-center gap-4">
                                <div className="bg-pink-500/10 p-3 rounded-xl group-hover:bg-pink-500/20 text-pink-400 transition-colors">
                                    <Server className="w-5 h-5" />
                                </div>
                                <div className="flex flex-col text-left">
                                    <span className="text-lg font-semibold text-zinc-200 group-hover:text-white transition-colors">
                                        FastAPI Server
                                    </span>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-pink-400 group-hover:translate-x-1 transition-all" />
                        </a>
                    </div>
                </div>
            </div>
        </main>
    );
}
