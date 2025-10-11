import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

interface MALTokenResponse {
    token_type: string;
    expires_in: number;
    access_token: string;
    refresh_token: string;
}

interface MALUserResponse {
    id: number;
    name: string;
    picture?: string;
    joined_at: number;
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get("code");
        const state = searchParams.get("state");
        const error = searchParams.get("error");

        if (error) {
            console.error("MAL OAuth error:", error);
            return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/?error=OAuthCallback`);
        }

        if (!code || !state) return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/?error=OAuthCallback`);

        const cookieStore = await cookies();
        const storedCodeVerifier = cookieStore.get("mal_code_verifier")?.value;
        const storedState = cookieStore.get("mal_state")?.value;
        const callbackUrl = cookieStore.get("mal_callback_url")?.value || "/";

        if (!storedCodeVerifier || !storedState || state !== storedState) return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/?error=OAuthCallback`);

        // Exchange authorization code for tokens
        const tokenResponse = await fetch("https://myanimelist.net/v1/oauth2/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                client_id: process.env.MAL_CLIENT_ID,
                client_secret: process.env.MAL_CLIENT_SECRET,
                grant_type: "authorization_code",
                code,
                redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/mal/callback`,
                code_verifier: storedCodeVerifier,
            }),
        });

        if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            console.error("MAL token exchange failed:", errorText);
            return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/?error=OAuthCallback`);
        }

        const tokens: MALTokenResponse = await tokenResponse.json();

        const userResponse = await fetch("https://api.myanimelist.net/v2/users/@me?fields=name,picture,joined_at", {
            headers: { Authorization: `Bearer ${tokens.access_token}` },
        });

        if (!userResponse.ok) {
            console.error("MAL user info fetch failed");
            return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/?error=OAuthCallback`);
        }

        const user: MALUserResponse = await userResponse.json();

        const sessionData = {
            user: {
                id: user.id.toString(),
                name: user.name,
                image: user.picture || null,
                url: `https://myanimelist.net/profile/${user.name}`,
                moderatorRoles: null,
                createdAt: Number(new Date(user.joined_at).getTime().toString().slice(0, -3)), // Convert to seconds
            },
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            accessTokenExpires: Date.now() + tokens.expires_in * 1000,
            activeProvider: "myanimelist" as const,
        };

        const redirectUrl = callbackUrl.startsWith("/") ? `${process.env.NEXTAUTH_URL}${callbackUrl}` : callbackUrl;
        const response = NextResponse.redirect(redirectUrl);

        response.cookies.delete("mal_code_verifier");
        response.cookies.delete("mal_state");
        response.cookies.delete("mal_callback_url");

        response.cookies.set("mal_session", btoa(JSON.stringify(sessionData)), {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 30 * 24 * 60 * 60, // 30 days
        });

        return response;
    } catch (error) {
        console.error("MAL callback error:", error);
        return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/?error=OAuthCallback`);
    }
}
