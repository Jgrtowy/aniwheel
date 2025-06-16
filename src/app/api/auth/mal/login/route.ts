import { type NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";

function generateCodeVerifier(): string {
    return crypto.randomBytes(32).toString("base64url");
}

function generateState(): string {
    return crypto.randomBytes(16).toString("hex");
}

export async function GET(request: NextRequest) {
    const code_verifier = generateCodeVerifier();
    const state = generateState();

    const pkceData = JSON.stringify({
        code_verifier,
        timestamp: Date.now(),
    });

    const params = new URLSearchParams({
        response_type: "code",
        client_id: process.env.MAL_CLIENT_ID ?? "",
        code_challenge_method: "plain",
        code_challenge: code_verifier,
        scope: "",
        state: state,
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/mal/callback`,
    });

    const authUrl = `https://myanimelist.net/v1/oauth2/authorize?${params.toString()}`;

    const response = NextResponse.redirect(authUrl);

    response.cookies.set(`mal-pkce-${state}`, pkceData, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 600,
    });

    return response;
}
