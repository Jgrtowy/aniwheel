"use client";

import type { Session } from "next-auth";
import { SessionProvider as NextAuthSessionProvider, useSession as nextAuthUseSession } from "next-auth/react";
import { type ReactNode, createContext, useCallback, useContext, useEffect, useState } from "react";

interface MALSession {
    user: {
        id: string;
        name: string;
        image: string | null;
        url: string;
        anilist: null;
        createdAt: number;
    };
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
    activeProvider: "myanimelist";
}

interface SessionContextType {
    session: Session | null;
    loading: boolean;
}

const SessionContext = createContext<SessionContextType>({
    session: null,
    loading: true,
});

function CustomSessionProvider({ children }: { children: ReactNode }) {
    const nextAuthSession = nextAuthUseSession();
    const [malSession, setMalSession] = useState<MALSession | null>(null);
    const [malSessionChecked, setMalSessionChecked] = useState(false);

    const checkMALSession = useCallback(async () => {
        if (malSessionChecked) return; // Prevent duplicate checks

        try {
            const response = await fetch("/api/auth/mal/session");
            if (response.ok) {
                const data = await response.json();
                if (data.session) {
                    setMalSession(data.session);
                }
            }
        } catch (error) {
            console.error("Error checking MAL session:", error);
        } finally {
            setMalSessionChecked(true);
        }
    }, [malSessionChecked]);

    useEffect(() => {
        // Only check MAL session if:
        // 1. NextAuth session is not loading and not available
        // 2. We haven't checked MAL session yet
        if (nextAuthSession.status === "unauthenticated" && !malSessionChecked) {
            checkMALSession();
        }
    }, [nextAuthSession.status, malSessionChecked, checkMALSession]);

    const getSession = (): Session | null => {
        // Return NextAuth session if available
        if (nextAuthSession.data) {
            return nextAuthSession.data;
        }

        // Return MAL session converted to NextAuth format
        if (malSession) {
            return {
                user: malSession.user,
                accessToken: malSession.accessToken,
                activeProvider: malSession.activeProvider,
                expires: new Date(malSession.accessTokenExpires).toISOString(),
            } as Session;
        }

        return null;
    };

    const isLoading = nextAuthSession.status === "loading" || (!nextAuthSession.data && !malSessionChecked);

    return (
        <SessionContext.Provider
            value={{
                session: getSession(),
                loading: isLoading,
            }}
        >
            {children}
        </SessionContext.Provider>
    );
}

export function ClientSessionProvider({ children }: { children: ReactNode }) {
    return (
        <NextAuthSessionProvider>
            <CustomSessionProvider>{children}</CustomSessionProvider>
        </NextAuthSessionProvider>
    );
}

export const useSession = (): Session | null => {
    const { session } = useContext(SessionContext);
    return session;
};

export const useSessionLoading = (): boolean => {
    const { loading } = useContext(SessionContext);
    return loading;
};
