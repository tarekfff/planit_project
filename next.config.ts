import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    // Required for the Docker multi-stage build.
    // Generates a self-contained .next/standalone folder that includes
    // only the files needed to run the server — no node_modules bloat.
    output: 'standalone',

    // (Optional) If you serve images from Supabase Storage, whitelist the domain
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '*.supabase.co',
                pathname: '/storage/v1/object/public/**',
            },
        ],
    },
}

export default nextConfig

