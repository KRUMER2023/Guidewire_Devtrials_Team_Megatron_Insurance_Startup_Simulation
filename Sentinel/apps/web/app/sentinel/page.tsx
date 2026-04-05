"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SentinelRoot() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/sentinel/rider');
    }, [router]);

    return (
        <div className="h-screen w-full flex items-center justify-center bg-[#0c0e10]">
            <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
}
