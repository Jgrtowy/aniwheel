import type { OAuthConfig, OAuthUserConfig } from "next-auth/providers/oauth";

// MyAnimeList Provider Configuration
interface MyAnimeListProfile {
    id: number;
    name: string;
    picture?: string;
    url: string;
}

export function MyAnimeListProvider<P extends MyAnimeListProfile>(options: OAuthUserConfig<P>): OAuthConfig<P> {
    return {
        id: "myanimelist",
        name: "MyAnimeList",
        type: "oauth",
        authorization: { url: "/api/auth/mal/signin", params: {} },
        token: { url: "/api/auth/mal/session" },
        userinfo: { url: "/api/auth/mal/session" },
        profile({ id, name, picture, url }: MyAnimeListProfile) {
            return { id: id.toString(), name, image: picture ?? "", url };
        },
        options,
    };
}
