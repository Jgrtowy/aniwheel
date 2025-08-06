import type { Metadata } from "next";
import { Comfortaa } from "next/font/google";
import { Toaster } from "~/components/ui/sonner";
import { ClientSessionProvider } from "~/providers/session-provider";
import { ThemeProvider } from "~/providers/theme-provider";
import "./globals.css";

const comfortaa = Comfortaa({
    variable: "--font-comfortaa",
    subsets: ["latin"],
    preload: true,
    display: "swap",
    weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
    title: "Aniwheel",
    description: "Don't know what to watch next? Aniwheel will help you decide!",
    icons: {
        icon: "/icon.svg",
        shortcut: "/icon.svg",
        apple: "/icon.svg",
    },
    creator: "Dawid Gul",
    keywords: ["anime", "wheel", "random", "decide", "watch", "myanimelist", "anilist", "anime list", "recommendations"],
    robots: {
        index: true,
        follow: true,
    },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${comfortaa.className} antialiased`}>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                    <ClientSessionProvider>{children}</ClientSessionProvider>
                </ThemeProvider>
                <Toaster richColors />
            </body>
        </html>
    );
}
