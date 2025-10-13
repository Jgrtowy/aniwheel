import type { NextAuthOptions, Session } from "next-auth";
import { getServerSession as nextAuthGetServerSession } from "next-auth/next";
import { AniListProvider } from "~/lib/auth/providers/anilist";
import { MyAnimeListProvider } from "~/lib/auth/providers/myanimelist";
import type { MalSessionPayload } from "~/lib/types";

declare module "next-auth" {
    interface User {
        id: string;
        name: string;
        image: string;
        url: string;
        anilist: {
            moderatorRoles: string[] | null;
            profileColor: "blue" | "purple" | "pink" | "orange" | "red" | "green" | "gray";
            titleLanguage: "ROMAJI" | "ENGLISH" | "NATIVE" | "ROMAJI_STYLISED" | "ENGLISH_STYLISED" | "NATIVE_STYLISED";
            bannerImage: string | null;
        } | null;
        createdAt: number;
    }

    interface Session {
        user: User;
        accessToken: string;
        activeProvider: "anilist" | "myanimelist";
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        name: string;
        image: string;
        url: string;
        accessToken: string;
        activeProvider: "anilist" | "myanimelist";
        anilist: {
            moderatorRoles: string[] | null;
            profileColor: "blue" | "purple" | "pink" | "orange" | "red" | "green" | "gray";
            titleLanguage: "ROMAJI" | "ENGLISH" | "NATIVE" | "ROMAJI_STYLISED" | "ENGLISH_STYLISED" | "NATIVE_STYLISED";
            bannerImage: string | null;
        } | null;
        createdAt: number;
    }
}

export const authOptions: NextAuthOptions = {
    providers: [
        AniListProvider({
            clientId: process.env.ANILIST_CLIENT_ID,
            clientSecret: process.env.ANILIST_CLIENT_SECRET,
        }),
        MyAnimeListProvider({
            clientId: process.env.MAL_CLIENT_ID,
            clientSecret: process.env.MAL_CLIENT_SECRET,
        }),
    ],
    secret: process.env.AUTH_SECRET,
    callbacks: {
        async jwt({ token, user, account }) {
            if (user && account) {
                token.id = user.id;
                token.name = user.name;
                token.image = user.image;
                token.url = user.url;
                token.accessToken = account.access_token as string;
                token.activeProvider = account.provider as "anilist" | "myanimelist";
                token.anilist = user.anilist;
                token.createdAt = user.createdAt;
            }
            return token;
        },

        async session({ session, token }) {
            if (token) {
                session.user.id = token.id;
                session.user.name = token.name;
                session.user.image = token.image;
                session.user.url = token.url;
                session.accessToken = token.accessToken;
                session.activeProvider = token.activeProvider;
                session.user.anilist = token.anilist;
                session.user.createdAt = token.createdAt;
            }
            return session;
        },
    },
};

export async function getServerSession(): Promise<Session | null> {
    // First try NextAuth session
    const nextAuthSession = await nextAuthGetServerSession(authOptions);
    if (nextAuthSession) {
        return nextAuthSession;
    }

    // If no NextAuth session, try to get MAL session from cookies
    try {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        const malSession = cookieStore.get("mal_session")?.value;

        if (malSession) {
            const sessionData = JSON.parse(atob(malSession)) as MalSessionPayload;

            // Check if token is expired, if so let client handle refresh
            if (Date.now() > sessionData.accessTokenExpires) return null;

            return {
                user: sessionData.user,
                accessToken: sessionData.accessToken,
                activeProvider: sessionData.activeProvider,
                expires: new Date(sessionData.accessTokenExpires).toISOString(),
            } as Session;
        }
    } catch (error) {
        console.error("Error reading MAL session:", error);
    }

    return null;
}
