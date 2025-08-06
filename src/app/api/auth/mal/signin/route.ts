import { randomBytes } from "node:crypto";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const callbackUrl = searchParams.get("callbackUrl") || "/";

        const codeVerifier = randomBytes(32).toString("base64url");
        const codeChallenge = codeVerifier;

        const state = randomBytes(32).toString("base64url");

        const response = NextResponse.redirect(
            `https://myanimelist.net/v1/oauth2/authorize?${new URLSearchParams({
                response_type: "code",
                client_id: process.env.MAL_CLIENT_ID,
                state,
                redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/mal/callback`,
                code_challenge: codeChallenge,
                code_challenge_method: "plain",
            })}`,
        );

        response.cookies.set("mal_code_verifier", codeVerifier, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 600, // 10 minutes
        });

        response.cookies.set("mal_state", state, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 600, // 10 minutes
        });

        response.cookies.set("mal_callback_url", callbackUrl, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 600, // 10 minutes
        });

        return response;
    } catch (error) {
        console.error("MAL signin error:", error);
        return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/?error=Configuration`);
    }
}
