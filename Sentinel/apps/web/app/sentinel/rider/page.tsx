"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function RiderRoot() {
    const router = useRouter();
    const { user } = useAuth();

    useEffect(() => {
        const userId = user?.id || '';
        router.replace(`/sentinel/rider/homepage${userId ? `?user=${userId}` : ''}`);
    }, [router, user]);

    return (
        <div className="h-screen w-full flex items-center justify-center bg-[#0c0e10]">
            <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
}
