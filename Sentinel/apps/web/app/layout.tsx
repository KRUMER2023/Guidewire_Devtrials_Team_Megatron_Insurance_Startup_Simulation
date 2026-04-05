import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: 'Sentinel',
    description: 'Sentinel Platform',
}

import { AuthProvider } from '@/context/AuthContext'

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <head>
                <script src={`https://apis.mappls.com/advancedmaps/api/${process.env.NEXT_PUBLIC_MAPPLS_ACCESS_TOKEN}/map_sdk?layer=vector&v=3.0`} crossOrigin="anonymous"></script>
                <script src={`https://apis.mappls.com/advancedmaps/api/${process.env.NEXT_PUBLIC_MAPPLS_ACCESS_TOKEN}/map_sdk_plugins?v=3.0&libraries=direction`} crossOrigin="anonymous"></script>
            </head>
            <body>
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    )
}
