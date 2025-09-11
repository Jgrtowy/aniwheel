import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "*.anilist.co",
                port: "",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "cdn.myanimelist.net",
                port: "",
                pathname: "/**",
            },
        ],
    },
    async headers() {
        return [
            {
                source: "/(.*)",
                headers: [
                    { key: "X-Frame-Options", value: "DENY" },
                    { key: "X-Content-Type-Options", value: "nosniff" },
                    { key: "Referrer-Policy", value: "origin-when-cross-origin" },
                ],
            },
        ];
    },
    async rewrites() {
        return [
            {
                source: "/skibidi/static/:path*",
                destination: "https://eu-assets.i.posthog.com/static/:path*",
            },
            {
                source: "/skibidi/:path*",
                destination: "https://eu.i.posthog.com/:path*",
            },
        ];
    },
    // This is required to support PostHog trailing slash API requests
    skipTrailingSlashRedirect: true,
};

export default nextConfig;
