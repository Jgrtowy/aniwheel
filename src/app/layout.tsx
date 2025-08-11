import "./globals.css";
import { MotionConfig } from "motion/react";
import type { Metadata } from "next";
import { Comfortaa } from "next/font/google";
import { Toaster } from "~/components/ui/sonner";
import { ClientSessionProvider } from "~/providers/session-provider";
import { ThemeProvider } from "~/providers/theme-provider";

const comfortaa = Comfortaa({
    variable: "--font-comfortaa",
    subsets: ["latin"],
    preload: true,
    display: "swap",
    weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
    title: {
        default: "Aniwheel - Your Anime Wheel of Fortune",
        template: "%s | Aniwheel",
    },
    description: "Discover your next anime with Aniwheel! Connect your AniList or MyAnimeList account and spin the wheel to randomly pick from your planned anime.",
    applicationName: "Aniwheel",
    generator: "Next.js",
    referrer: "origin-when-cross-origin",
    creator: "Dawid Gul & Wojtek Zrałek",
    authors: [
        { name: "Dawid Gul", url: "https://github.com/Jgrtowy" },
        { name: "Wojtek Zrałek", url: "https://github.com/theSaintKappa" },
    ],
    metadataBase: new URL("https://aniwheel.moe"),
    alternates: { canonical: "/" },
    openGraph: {
        type: "website",
        locale: "en_US",
        url: "https://aniwheel.moe",
        title: "Aniwheel - Your Anime Wheel of Fortune",
        description: "Discover your next anime with Aniwheel! Connect your AniList or MyAnimeList account and spin the wheel to randomly pick from your planned anime.",
        siteName: "Aniwheel",
        images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Aniwheel - Your Anime Wheel of Fortune" }],
    },
    icons: {
        icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
        shortcut: "/favicon.ico",
        apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    },
    manifest: "/site.webmanifest",
    keywords: [
        "anime",
        "wheel",
        "random anime picker",
        "anime selector",
        "anime recommendations",
        "what anime to watch",
        "myanimelist",
        "anilist",
        "anime list",
        "planned anime",
        "anime planning",
        "random anime generator",
        "anime decision maker",
        "anime wheel of fortune",
        "anime roulette",
        "watch next anime",
        "anime discovery",
        "anime randomizer",
    ],
    category: "Entertainment",
    classification: "Anime Discovery Tool",
    robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
    },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${comfortaa.className} antialiased`}>
                <MotionConfig reducedMotion="user">
                    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                        <ClientSessionProvider>{children}</ClientSessionProvider>
                    </ThemeProvider>
                    <Toaster richColors />
                </MotionConfig>
            </body>
        </html>
    );
}
