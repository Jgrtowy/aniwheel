import { signIn, signOut, useSession as useNextAuthSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";

export interface UserProfile {
    id: string;
    name: string;
    image?: string;
    accessToken: string;
    provider: "anilist" | "myanimelist";
}

export interface SessionState {
    user: UserProfile | UserProfile[] | null;

    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    activeProvider?: "anilist" | "myanimelist";

    login: (provider: "anilist" | "myanimelist") => void;
    logout: (provider?: "anilist" | "myanimelist") => Promise<void>;
    refresh: () => void;
}

export function useUnifiedSession(): SessionState {
    const { data: nextAuthSession, status } = useNextAuthSession();

    const [malUser, setMalUser] = useState<UserProfile | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [activeProvider, setActiveProvider] = useState<"anilist" | "myanimelist" | undefined>();

    const anilistUser: UserProfile | null = nextAuthSession?.user
        ? {
              id: nextAuthSession.id ?? "",
              name: nextAuthSession.user.name ?? "",
              image: nextAuthSession.user.image ?? undefined,
              accessToken: nextAuthSession.accessToken ?? "",
              provider: "anilist",
          }
        : null;

    const checkMALAuth = useCallback(() => {
        if (typeof window !== "undefined") {
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get("mal_auth") === "success") {
                const newUrl = window.location.pathname;
                window.history.replaceState({}, "", newUrl);
                window.location.reload();
                return;
            }

            const error = urlParams.get("error");
            if (error) {
                setError(`Authentication error: ${error}`);
                const newUrl = window.location.pathname;
                window.history.replaceState({}, "", newUrl);
            }
        }
    }, []);

    const fetchMALUser = useCallback(async () => {
        try {
            const response = await fetch("/api/auth/mal/user");
            if (response.ok) {
                const data = await response.json();
                if (data.user) {
                    setMalUser({
                        ...data.user,
                        provider: "myanimelist",
                    });
                } else {
                    setMalUser(null);
                }
            } else {
                setMalUser(null);
            }
        } catch (error) {
            console.error("Failed to fetch MAL user:", error);
            setMalUser(null);
        }
    }, []);

    useEffect(() => {
        checkMALAuth();
        fetchMALUser();
    }, [checkMALAuth, fetchMALUser]);

    useEffect(() => {
        if (nextAuthSession?.malUser) {
            setMalUser({
                ...nextAuthSession.malUser,
                provider: "myanimelist",
            });
        }
    }, [nextAuthSession?.malUser]);

    useEffect(() => {
        if (!activeProvider) {
            if (anilistUser) {
                setActiveProvider("anilist");
            } else if (malUser) {
                setActiveProvider("myanimelist");
            }
        }
    }, [anilistUser, malUser, activeProvider]);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedProvider = localStorage.getItem("aniwheel-active-provider") as "anilist" | "myanimelist" | null;
            if (storedProvider) {
                setActiveProvider(storedProvider);
            }
        }
    }, []);

    const users: UserProfile[] = [];
    if (anilistUser) users.push(anilistUser);
    if (malUser) users.push(malUser);

    let user: UserProfile | UserProfile[] | null = null;
    if (users.length === 1) {
        user = users[0];
    } else if (users.length > 1) {
        user = users;
    }

    const login = useCallback((provider: "anilist" | "myanimelist") => {
        if (typeof window === "undefined") return;

        setActiveProvider(provider);
        localStorage.setItem("aniwheel-active-provider", provider);

        if (provider === "anilist") {
            signIn("anilist", { callbackUrl: window.location.href });
        } else if (provider === "myanimelist") {
            window.location.href = "/api/auth/mal/login";
        }
    }, []);

    const logout = useCallback(
        async (provider?: "anilist" | "myanimelist") => {
            const logoutProvider = provider || activeProvider;

            if (!logoutProvider || logoutProvider === "anilist") {
                try {
                    await signOut({ redirect: false });
                } catch (error) {
                    console.error("Failed to logout from AniList:", error);
                }
            }

            if (!logoutProvider || logoutProvider === "myanimelist") {
                try {
                    await fetch("/api/auth/mal/logout", { method: "POST" });
                    setMalUser(null);
                } catch (error) {
                    console.error("Failed to logout from MAL:", error);
                }
            }

            if (typeof window !== "undefined") {
                window.location.reload();
            }
        },
        [activeProvider],
    );

    const refresh = useCallback(() => {
        fetchMALUser();
    }, [fetchMALUser]);

    return {
        user,
        isAuthenticated: users.length > 0,
        isLoading: status === "loading",
        error,
        activeProvider,
        login,
        logout,
        refresh,
    };
}
