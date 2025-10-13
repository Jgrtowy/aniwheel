"use client";

import type { Session } from "next-auth";
import { SessionProvider as NextAuthSessionProvider, useSession as nextAuthUseSession } from "next-auth/react";
import { type ReactNode, createContext, useContext, useEffect, useMemo, useState } from "react";
import { fetchMalSession } from "~/lib/auth";
import type { MalSessionPayload } from "~/lib/types";

interface MalSessionState {
    data: MalSessionPayload | null;
    checked: boolean;
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
    const [malSessionState, setMalSessionState] = useState<MalSessionState>({ data: null, checked: false });

    useEffect(() => {
        if (nextAuthSession.status !== "unauthenticated" || malSessionState.checked) return;

        let cancelled = false;

        (async () => {
            try {
                const session = await fetchMalSession();
                if (!cancelled) {
                    setMalSessionState({ data: session, checked: true });
                }
            } catch (_error) {
                if (!cancelled) {
                    setMalSessionState({ data: null, checked: true });
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [nextAuthSession.status, malSessionState.checked]);

    const mergedSession = useMemo((): Session | null => {
        if (nextAuthSession.data) {
            return nextAuthSession.data;
        }

        if (malSessionState.data) {
            return {
                user: malSessionState.data.user,
                accessToken: malSessionState.data.accessToken,
                activeProvider: malSessionState.data.activeProvider,
                expires: new Date(malSessionState.data.accessTokenExpires).toISOString(),
            } as Session;
        }

        return null;
    }, [nextAuthSession.data, malSessionState.data]);

    const isLoading = nextAuthSession.status === "loading" || (!nextAuthSession.data && !malSessionState.checked);

    return (
        <SessionContext.Provider
            value={{
                session: mergedSession,
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
