"use client";

import type { Session } from "next-auth";
import { signIn as nextAuthSignIn, signOut as nextAuthSignOut } from "next-auth/react";
import type { MalSessionPayload } from "./types";

export const signIn = (provider: string, options?: { callbackUrl?: string }) => {
    if (provider === "myanimelist") {
        const callbackUrl = options?.callbackUrl || window.location.origin;
        window.location.href = `/api/auth/mal/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`;
        return;
    }

    return nextAuthSignIn(provider, options);
};

export const fetchMalSession = async (): Promise<MalSessionPayload | null> => {
    try {
        const response = await fetch("/api/auth/mal/session");
        if (!response.ok) {
            console.error("Failed to fetch MAL session:", response.statusText);
            return null;
        }

        const data: { session: MalSessionPayload | null } = await response.json();
        return data.session ?? null;
    } catch (error) {
        console.error("Error fetching MAL session:", error);
        return null;
    }
};

export const signOut = async (options?: { callbackUrl?: string }) => {
    try {
        await fetch("/api/auth/mal/session", { method: "DELETE" });
    } catch (error) {
        console.error("Error clearing MAL session:", error);
    }

    return nextAuthSignOut(options);
};

export type AniListSession = Session & {
    activeProvider: "anilist";
    user: Session["user"] & { anilist: NonNullable<Session["user"]["anilist"]> };
};

export const isAniListSession = (session: Session | null | undefined): session is AniListSession => !!session && session.activeProvider === "anilist" && !!session.user?.anilist;
