"use client";

import { signIn as nextAuthSignIn, signOut as nextAuthSignOut } from "next-auth/react";

export const signIn = (provider: string, options?: { callbackUrl?: string }) => {
    if (provider === "myanimelist") {
        const callbackUrl = options?.callbackUrl || window.location.origin;
        window.location.href = `/api/auth/mal/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`;
        return;
    }

    return nextAuthSignIn(provider, options);
};

export const signOut = async (options?: { callbackUrl?: string }) => {
    try {
        await fetch("/api/auth/mal/session", { method: "DELETE" });
    } catch (error) {
        console.error("Error clearing MAL session:", error);
    }

    return nextAuthSignOut(options);
};
