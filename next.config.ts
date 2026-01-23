import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "*.anilist.co",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "cdn.myanimelist.net",
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
    output: "standalone",
    reactCompiler: true,
};

export default nextConfig;
