import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";

export interface MALUser {
    id: string;
    name: string;
    image?: string;
    accessToken: string;
}

export interface AniListUser {
    id: string;
    name: string;
    image?: string;
    accessToken: string;
}

export interface UnifiedSession {
    anilistUser: AniListUser | null;
    malUser: MALUser | null;
    loading: boolean;
    error: string | null;
    provider?: string;
}

export function useUnifiedSession(): UnifiedSession & {
    loginWithAniList: () => void;
    loginWithMAL: () => void;
    logoutAniList: () => void;
    logoutMAL: () => void;
    refresh: () => void;
} {
    const { data: nextAuthSession, status } = useSession();
    const [malUser, setMalUser] = useState<MALUser | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Convert NextAuth session to AniList user
    const anilistUser: AniListUser | null = nextAuthSession?.user
        ? {
              id: nextAuthSession.id ?? "",
              name: nextAuthSession.user.name ?? "",
              image: nextAuthSession.user.image ?? undefined,
              accessToken: nextAuthSession.accessToken ?? "",
          }
        : null;

    // Check for MAL user in cookies on client side
    const checkMALUser = useCallback(() => {
        if (typeof window !== "undefined") {
            // Check URL for MAL auth success
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get("mal_auth") === "success") {
                // Remove the URL parameter
                const newUrl = window.location.pathname;
                window.history.replaceState({}, "", newUrl);

                // Refresh to get updated session with MAL data
                window.location.reload();
                return;
            }

            // Check for MAL auth errors
            const error = urlParams.get("error");
            if (error) {
                setError(`Authentication error: ${error}`);
                // Clean up URL
                const newUrl = window.location.pathname;
                window.history.replaceState({}, "", newUrl);
            }
        }
    }, []);

    // Fetch MAL user data from server
    const fetchMALUser = useCallback(async () => {
        try {
            const response = await fetch("/api/auth/mal/user");
            if (response.ok) {
                const data = await response.json();
                setMalUser(data.user);
            } else {
                setMalUser(null);
            }
        } catch (error) {
            console.error("Failed to fetch MAL user:", error);
            setMalUser(null);
        }
    }, []);

    useEffect(() => {
        checkMALUser();
        fetchMALUser();
    }, [checkMALUser, fetchMALUser]);

    // Also check MAL user from NextAuth session if available
    useEffect(() => {
        if (nextAuthSession?.malUser) {
            setMalUser(nextAuthSession.malUser);
        }
    }, [nextAuthSession?.malUser]);

    const loginWithAniList = useCallback(() => {
        if (typeof window !== "undefined") {
            window.location.href = "/api/auth/signin/anilist";
        }
    }, []);

    const loginWithMAL = useCallback(() => {
        if (typeof window !== "undefined") {
            window.location.href = "/api/auth/mal/login";
        }
    }, []);

    const logoutAniList = useCallback(async () => {
        if (typeof window !== "undefined") {
            window.location.href = "/api/auth/signout";
        }
    }, []);

    const logoutMAL = useCallback(async () => {
        try {
            await fetch("/api/auth/mal/logout", { method: "POST" });
            setMalUser(null);
        } catch (error) {
            console.error("Failed to logout from MAL:", error);
        }
    }, []);

    const refresh = useCallback(() => {
        fetchMALUser();
    }, [fetchMALUser]);

    return {
        anilistUser,
        malUser,
        loading: status === "loading",
        error,
        loginWithAniList,
        loginWithMAL,
        logoutAniList,
        logoutMAL,
        refresh,
    };
}
