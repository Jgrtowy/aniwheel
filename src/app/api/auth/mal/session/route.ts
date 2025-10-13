import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { MalSessionPayload } from "~/lib/types";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const malSession = cookieStore.get("mal_session")?.value;

        if (!malSession) return NextResponse.json({ session: null });

        const sessionData = JSON.parse(atob(malSession)) as MalSessionPayload;

        if (Date.now() > sessionData.accessTokenExpires) {
            const refreshResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/mal/refresh`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    refreshToken: sessionData.refreshToken,
                }),
            });

            if (refreshResponse.ok) {
                const refreshedTokens = await refreshResponse.json();

                sessionData.accessToken = refreshedTokens.accessToken;
                sessionData.refreshToken = refreshedTokens.refreshToken;
                sessionData.accessTokenExpires = refreshedTokens.accessTokenExpires;

                const response = NextResponse.json({ session: sessionData });
                response.cookies.set("mal_session", btoa(JSON.stringify(sessionData)), {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                    maxAge: 30 * 24 * 60 * 60, // 30 days
                });

                return response;
            }

            const response = NextResponse.json({ session: null });
            response.cookies.delete("mal_session");
            return response;
        }

        return NextResponse.json({ session: sessionData });
    } catch (error) {
        console.error("MAL session error:", error);
        return NextResponse.json({ session: null });
    }
}

export async function DELETE() {
    try {
        const response = NextResponse.json({ success: true });
        response.cookies.delete("mal_session");
        return response;
    } catch (error) {
        console.error("MAL session deletion error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
