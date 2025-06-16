import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
        return NextResponse.redirect(`${process.env.NEXTAUTH_URL}?error=oauth_error`);
    }

    if (!code || !state) {
        return NextResponse.redirect(`${process.env.NEXTAUTH_URL}?error=missing_parameters`);
    }

    const pkceData = request.cookies.get(`mal-pkce-${state}`)?.value;

    if (!pkceData) {
        return NextResponse.redirect(`${process.env.NEXTAUTH_URL}?error=pkce_not_found`);
    }

    try {
        const { code_verifier, timestamp } = JSON.parse(pkceData);

        if (Date.now() - timestamp > 10 * 60 * 1000) {
            return NextResponse.redirect(`${process.env.NEXTAUTH_URL}?error=pkce_expired`);
        }

        const tokenResponse = await fetch("https://myanimelist.net/v1/oauth2/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                grant_type: "authorization_code",
                code,
                redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/mal/callback`,
                code_verifier,
                client_id: process.env.MAL_CLIENT_ID ?? "",
            }),
        });

        if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            console.error("MAL token exchange failed:", errorText);
            return NextResponse.redirect(`${process.env.NEXTAUTH_URL}?error=token_exchange_failed`);
        }

        const tokenData = await tokenResponse.json();

        const profileResponse = await fetch("https://api.myanimelist.net/v2/users/@me", {
            headers: {
                Authorization: `Bearer ${tokenData.access_token}`,
            },
        });

        if (!profileResponse.ok) {
            console.error("MAL profile fetch failed");
            return NextResponse.redirect(`${process.env.NEXTAUTH_URL}?error=profile_fetch_failed`);
        }

        const profile = await profileResponse.json();

        const userData = {
            id: profile.id,
            name: profile.name,
            image: profile.picture,
            accessToken: tokenData.access_token,
        };

        const response = NextResponse.redirect(`${process.env.NEXTAUTH_URL}?mal_auth=success`);

        response.cookies.delete(`mal-pkce-${state}`);

        response.cookies.set("mal-user", encodeURIComponent(JSON.stringify(userData)), {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60, // 7 days
        });

        return response;
    } catch (error) {
        console.error("MAL callback error:", error);
        return NextResponse.redirect(`${process.env.NEXTAUTH_URL}?error=callback_error`);
    }
}
