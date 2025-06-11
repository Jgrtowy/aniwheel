import type { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth";
import type { OAuthConfig } from "next-auth/providers/oauth";
import { Buffer } from "node:buffer";

declare module "next-auth" {
    interface Session {
        accessToken?: string;
        provider?: string;
        id?: string;
    }
}

// biome-ignore lint/suspicious/noExplicitAny: custom structure
const anilistProvider: OAuthConfig<any> = {
    id: "anilist",
    name: "AniList",
    type: "oauth",
    clientId: process.env.ANILIST_CLIENT_ID ?? "",
    authorization: {
        url: "https://anilist.co/api/v2/oauth/authorize",
        params: {
            response_type: "code",
            client_id: process.env.ANILIST_CLIENT_ID ?? "",
            redirect_uri: "http://localhost:3000/api/auth/callback/anilist",
            scope: "",
        },
    },
    token: {
        url: "https://anilist.co/api/v2/oauth/token",
        async request(context: { params: { code?: string } }) {
            const res = await fetch("https://anilist.co/api/v2/oauth/token", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                    grant_type: "authorization_code",
                    code: context.params.code ?? "",
                    client_id: process.env.ANILIST_CLIENT_ID ?? "",
                    client_secret: process.env.ANILIST_CLIENT_SECRET ?? "",
                    redirect_uri: "http://localhost:3000/api/auth/callback/anilist",
                }),
            });

            const data = await res.json();
            return { tokens: data };
        },
    },
    checks: ["pkce"],
    userinfo: {
        url: "https://graphql.anilist.co",
        async request(context) {
            const accessToken = context.tokens.access_token;
            if (!accessToken) throw new Error("No access token provided for AniList user info request");

            const query = `
      query {
        Viewer {
          id
          name
          avatar {
            large
            medium
          }
        }
      }
    `;

            const res = await fetch("https://graphql.anilist.co", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ query }),
            });

            if (!res.ok) {
                throw new Error(`Failed to fetch AniList user profile: ${await res.text()}`);
            }

            const data = await res.json();
            const user = data.data.Viewer;

            return {
                id: user.id,
                name: user.name,
                avatar: {
                    medium: user.avatar.medium,
                    large: user.avatar.large,
                },
            };
        },
    },
    profile(profile: {
        id: string;
        name: string;
        avatar?: { medium: string; large: string };
    }) {
        return {
            id: profile.id,
            name: profile.name,
            image: profile.avatar?.large ?? profile.avatar?.medium ?? "",
        };
    },
};

// biome-ignore lint/suspicious/noExplicitAny: custom structure
const malProvider: OAuthConfig<any> = {
    id: "myanimelist",
    name: "MyAnimeList",
    type: "oauth",
    clientId: process.env.MAL_CLIENT_ID ?? "",
    authorization: {
        url: "https://myanimelist.net/v1/oauth2/authorize",
        params: {
            response_type: "code",
            code_challenge: process.env.MAL_CODE_CHALLENGE ?? "",
            client_id: process.env.MAL_CLIENT_ID ?? "",
            redirect_uri: "http://localhost:3000/api/auth/callback/myanimelist",
            code_challenge_method: "plain",
        },
    },
    token: {
        url: "https://myanimelist.net/v1/oauth2/token",
        async request(context: {
            params: { code?: string };
            checks?: { code_verifier?: string };
        }) {
            const code = context.params.code ?? "";
            const body = new URLSearchParams({
                grant_type: "authorization_code",
                code,
                redirect_uri: "http://localhost:3000/api/auth/callback/myanimelist",
                code_verifier: process.env.MAL_CODE_CHALLENGE ?? "",
                client_id: process.env.MAL_CLIENT_ID ?? "",
            });
            const res = await fetch("https://myanimelist.net/v1/oauth2/token", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    Authorization: `Bearer ${process.env.MAL_CLIENT_ID}`,
                },
                body,
            });

            if (!res.ok) {
                console.error("❌ MAL token request failed:", await res.text());
                throw new Error("Failed to fetch MAL access token");
            }

            const data = await res.json();

            if (!data.access_token) {
                console.error("❌ MAL token response missing access_token:", data);
                throw new Error("MAL token response is missing access_token");
            }
            return {
                tokens: {
                    access_token: data.access_token,
                    refresh_token: data.refresh_token,
                    expires_in: data.expires_in,
                    token_type: data.token_type,
                    scope: data.scope,
                },
            };
        },
    },
    userinfo: {
        url: "https://api.myanimelist.net/v2/users/@me",
        async request(context) {
            if (!context.tokens.access_token) {
                throw new Error("No access token provided for MAL user info request");
            }

            const res = await fetch("https://api.myanimelist.net/v2/users/@me", {
                headers: {
                    Authorization: `Bearer ${context.tokens.access_token}`,
                },
            });
            if (!res.ok) throw new Error("Failed to fetch MAL profile");
            return await res.json();
        },
    },
    profile(profile: { id: string; name: string; picture?: string }) {
        return {
            id: profile.id,
            name: profile.name,
            image: profile.picture,
        };
    },
    checks: ["none"],
};

export const authOptions: NextAuthOptions = {
    providers: [anilistProvider, malProvider],
    secret: process.env.AUTH_SECRET,
    callbacks: {
        async jwt({ token, account, user }) {
            if (account?.access_token) {
                token.accessToken = account.access_token;
                token.provider = account.provider;
            }
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            session.accessToken = typeof token.accessToken === "string" ? token.accessToken : undefined;
            session.provider = typeof token.provider === "string" ? token.provider : undefined;
            session.id = typeof token.id === "string" ? token.id : undefined;
            return session;
        },
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
