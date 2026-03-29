import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: 'GigShield',
    description: 'GigShield Platform',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <head>
                <script src="https://apis.mappls.com/advancedmaps/api/f0963c17a2d9362a6ab9975e12f34a00/map_sdk?layer=vector&v=3.0" crossOrigin="anonymous"></script>
            </head>
            <body>{children}</body>
        </html>
    )
}
