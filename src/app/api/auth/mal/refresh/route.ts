import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

interface MALTokenResponse {
    token_type: string;
    expires_in: number;
    access_token: string;
    refresh_token: string;
}

export async function POST(request: NextRequest) {
    try {
        const { refreshToken } = await request.json();

        if (!refreshToken) return NextResponse.json({ error: "Refresh token required" }, { status: 400 });

        const tokenResponse = await fetch("https://myanimelist.net/v1/oauth2/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Basic ${Buffer.from(`${process.env.MAL_CLIENT_ID}:${process.env.MAL_CLIENT_SECRET}`).toString("base64")}`,
            },
            body: new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token: refreshToken,
            }),
        });

        if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            console.error("MAL token refresh failed:", errorText);
            return NextResponse.json({ error: "Token refresh failed" }, { status: 401 });
        }

        const tokens: MALTokenResponse = await tokenResponse.json();

        return NextResponse.json({
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            accessTokenExpires: Date.now() + tokens.expires_in * 1000,
        });
    } catch (error) {
        console.error("MAL token refresh error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
