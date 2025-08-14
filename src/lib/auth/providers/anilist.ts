import type { OAuthConfig, OAuthUserConfig } from "next-auth/providers/oauth";

// AniList Provider Configuration
interface AniListProfile {
    id: number;
    name: string;
    avatar: {
        large: string;
        medium: string;
    };
    siteUrl: string;
}

export function AniListProvider<P extends AniListProfile>(options: OAuthUserConfig<P>): OAuthConfig<P> {
    return {
        id: "anilist",
        name: "AniList",
        type: "oauth",
        authorization: {
            url: "https://anilist.co/api/v2/oauth/authorize",
            params: {
                scope: "",
                response_type: "code",
            },
        },
        token: "https://anilist.co/api/v2/oauth/token",
        userinfo: {
            url: "https://graphql.anilist.co",
            async request({ tokens }) {
                const response = await fetch("https://graphql.anilist.co", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${tokens.access_token}`,
                    },
                    body: JSON.stringify({
                        query: `
              query {
                Viewer {
                  id
                  name
                  avatar {
                    large
                    medium
                  }
                  siteUrl
                }
              }
            `,
                    }),
                });

                const data = await response.json();
                return data.data.Viewer as AniListProfile;
            },
        },
        profile({ id, name, avatar, siteUrl }: AniListProfile) {
            return { id: id.toString(), name, image: avatar.large || avatar.medium, url: siteUrl };
        },
        options,
    };
}
