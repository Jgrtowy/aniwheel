import type { OAuthConfig, OAuthUserConfig } from "next-auth/providers/oauth";
export interface AniListProfile {
    id: number;
    name: string;
    avatar: {
        large: string;
        medium: string;
    };
    bannerImage: string | null;
    siteUrl: string;
    moderatorRoles: string[] | null;
    options: {
        profileColor: "blue" | "purple" | "green" | "orange" | "red" | "pink" | "gray";
        titleLanguage: "ROMAJI" | "ENGLISH" | "NATIVE" | "ROMAJI_STYLISED" | "ENGLISH_STYLISED" | "NATIVE_STYLISED";
    };
    createdAt: number;
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
                  bannerImage
                  siteUrl
                  moderatorRoles
                  options {
                    profileColor
                    titleLanguage
                  }
                  createdAt
                }
              }
            `,
                    }),
                });

                const data = await response.json();
                return data.data.Viewer as AniListProfile;
            },
        },
        profile({ id, name, avatar, bannerImage, siteUrl, moderatorRoles, options, createdAt }: AniListProfile) {
            return {
                id: id.toString(),
                name,
                image: avatar.large || avatar.medium,
                url: siteUrl,
                anilist: {
                    moderatorRoles: moderatorRoles || null,
                    profileColor: options.profileColor,
                    titleLanguage: options.titleLanguage,
                    bannerImage,
                },
                createdAt,
            };
        },
        options,
    };
}
