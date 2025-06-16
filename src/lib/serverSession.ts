import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { authOptions } from "~/server/auth";

export interface ServerUnifiedSession {
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
}

export async function getUnifiedServerSession(): Promise<ServerUnifiedSession> {
    const nextAuthSession = await getServerSession(authOptions);

    const cookieStore = cookies();
    const malUserCookie = (await cookieStore).get("mal-user")?.value;

    let malUser = null;
    if (malUserCookie) {
        try {
            malUser = JSON.parse(decodeURIComponent(malUserCookie));
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

    return {
        anilistUser,
        malUser,
    };
}

export async function getAniListServerSession() {
    const session = await getUnifiedServerSession();
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

export async function getMALServerSession() {
    const session = await getUnifiedServerSession();
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

export async function getProviderServerSession(provider: "anilist" | "myanimelist") {
    if (provider === "anilist") {
        return getAniListServerSession();
    }
    return getMALServerSession();
}
