import type { OAuthConfig, OAuthUserConfig } from "next-auth/providers/oauth";

// MyAnimeList Provider Configuration
interface MyAnimeListProfile {
    id: number;
    name: string;
    picture?: string;
}

export function MyAnimeListProvider<P extends MyAnimeListProfile>(options: OAuthUserConfig<P>): OAuthConfig<P> {
    return {
        id: "myanimelist",
        name: "MyAnimeList",
        type: "oauth",
        authorization: {
            url: "/api/auth/mal/signin", // Custom OAuth flow
            params: {},
        },
        token: {
            url: "/api/auth/mal/session", // Custom session management
        },
        userinfo: {
            url: "/api/auth/mal/session",
            async request() {
                // This won't be used since we handle everything in our custom routes
                return {
                    id: 0,
                    name: "",
                    picture: undefined,
                };
            },
        },
        profile(profile: MyAnimeListProfile) {
            return {
                id: profile.id.toString(),
                name: profile.name,
                image: profile.picture ?? "",
            };
        },
        style: {
            logo: "https://cdn.myanimelist.net/images/mal_favicon.png",
            logoDark: "https://cdn.myanimelist.net/images/mal_favicon.png",
            bg: "#2e51a2",
            text: "#fff",
            bgDark: "#2e51a2",
            textDark: "#fff",
        },
        options,
    };
}
