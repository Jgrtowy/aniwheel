import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { authOptions } from "~/server/auth";

export interface UserProfile {
    id: string;
    name: string;
    image?: string;
    accessToken: string;
    provider: "anilist" | "myanimelist";
}

export interface UnifiedSession {
    anilistUser: {
        id: string;
        name: string;
        image?: string;
        accessToken: string;
    } | null;
    malUser: {
        id: string;
        name: string;
        image?: string;
        accessToken: string;
    } | null;

    user: UserProfile | UserProfile[] | null;

    isAuthenticated: boolean;

    activeProvider?: "anilist" | "myanimelist";

    accessToken?: string;

    userName?: string;
}

export async function getSession(): Promise<UnifiedSession> {
    const nextAuthSession = await getServerSession(authOptions);

    const cookieStore = cookies();
    const malUserCookie = (await cookieStore).get("mal-user")?.value;

    let malUser = null;
    if (malUserCookie) {
        try {
            if (malUserCookie.length > 0) {
                const parsedUser = JSON.parse(decodeURIComponent(malUserCookie));
                malUser = {
                    id: parsedUser.id,
                    name: parsedUser.name,
                    image: parsedUser.image,
                    accessToken: parsedUser.accessToken,
                };
            }
        } catch (error) {
            console.error("Failed to parse MAL user cookie:", error);
        }
    }

    const anilistUser = nextAuthSession?.user
        ? {
              id: nextAuthSession.id ?? "",
              name: nextAuthSession.user.name ?? "",
              image: nextAuthSession.user.image ?? undefined,
              accessToken: nextAuthSession.accessToken ?? "",
          }
        : null;

    const users: UserProfile[] = [];

    if (anilistUser) {
        users.push({
            ...anilistUser,
            provider: "anilist",
        });
    }

    if (malUser) {
        users.push({
            ...malUser,
            provider: "myanimelist",
        });
    }

    let user: UserProfile | UserProfile[] | null = null;
    if (users.length === 1) {
        user = users[0];
    } else if (users.length > 1) {
        user = users;
    }
    let activeProvider: "anilist" | "myanimelist" | undefined = undefined;
    let accessToken: string | undefined = undefined;
    let userName: string | undefined = undefined;

    if (users.length > 0) {
        const primaryUser = users[0];
        activeProvider = primaryUser.provider;
        accessToken = primaryUser.accessToken;
        userName = primaryUser.name;
    }

    return {
        anilistUser,
        malUser,
        user,
        isAuthenticated: users.length > 0,
        activeProvider,
        accessToken,
        userName,
    };
}

export async function getProviderSession(provider: "anilist" | "myanimelist") {
    const session = await getSession();

    if (provider === "anilist") {
        return session.anilistUser
            ? {
                  user: {
                      id: session.anilistUser.id,
                      name: session.anilistUser.name,
                      image: session.anilistUser.image,
                  },
                  accessToken: session.anilistUser.accessToken,
                  provider: "anilist",
              }
            : null;
    }

    return session.malUser
        ? {
              user: {
                  id: session.malUser.id,
                  name: session.malUser.name,
                  image: session.malUser.image,
              },
              accessToken: session.malUser.accessToken,
              provider: "myanimelist",
          }
        : null;
}
