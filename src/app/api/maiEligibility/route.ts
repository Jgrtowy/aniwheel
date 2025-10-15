import type { Session } from "next-auth";
import { unstable_cache } from "next/cache";
import { getServerSession } from "~/server/auth";

const MAL_MEDIA_ID = 37450;
// const CACHE_TTL_SECONDS = 60 * 15;
const CACHE_TTL_SECONDS = 1;

type AniListMediaResponse = {
    data?: {
        Media?: {
            mediaListEntry?: {
                status?: "CURRENT" | "COMPLETED" | "PAUSED" | "DROPPED" | "REPEATING" | "PLANNING" | null;
                progress?: number | null;
            } | null;
        } | null;
    };
};

type MalMediaResponse = {
    my_list_status?: {
        status?: "watching" | "completed" | "on_hold" | "dropped" | "plan_to_watch" | null;
        num_episodes_watched?: number;
    } | null;
};

async function checkAniList(session: Session): Promise<boolean> {
    const response = await fetch("https://graphql.anilist.co", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.accessToken}` },
        body: JSON.stringify({
            query: `
query MaiStatus($idMal: Int!) {
  Media(idMal: $idMal) {
    mediaListEntry {
      status
      progress
    }
  }
}
`,
            variables: { idMal: MAL_MEDIA_ID },
        }),
    });

    if (!response.ok) throw new Error("Failed to query AniList for AoButa status");

    const payload = (await response.json()) as AniListMediaResponse;
    const entry = payload.data?.Media?.mediaListEntry;

    if (!entry?.status) return false;
    if (entry.status === "COMPLETED" || entry.status === "REPEATING") return true;
    if (entry.status === "CURRENT" || entry.status === "PAUSED" || entry.status === "DROPPED") return (entry.progress ?? 0) > 0;

    return false;
}

async function checkMyAnimeList(session: Session): Promise<boolean> {
    const response = await fetch(`https://api.myanimelist.net/v2/anime/${MAL_MEDIA_ID}?fields=my_list_status{status,num_episodes_watched}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${session.accessToken}` },
    });

    if (!response.ok) throw new Error("Failed to query MyAnimeList for AoButa status");

    const payload = (await response.json()) as MalMediaResponse;
    const entry = payload.my_list_status;

    if (!entry?.status) return false;
    if (entry.status === "completed") return true;
    if (entry.status === "watching" || entry.status === "on_hold" || entry.status === "dropped") return (entry.num_episodes_watched ?? 0) > 0;

    return false;
}

export async function GET() {
    const session = await getServerSession();
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (!session.accessToken) return Response.json({ error: "Access token not available" }, { status: 401 });

    const cacheKey = `mai-eligibility-${session.activeProvider}-${session.user.id}`;

    const resolveMaiEligibility = unstable_cache(
        async () => {
            if (session.activeProvider === "anilist") return checkAniList(session);
            if (session.activeProvider === "myanimelist") return checkMyAnimeList(session);
            throw new Error("Unsupported provider for Mai eligibility check");
        },
        [cacheKey],
        { revalidate: CACHE_TTL_SECONDS },
    );

    try {
        const showMai = await resolveMaiEligibility();
        return Response.json({ showMai }, { status: 200 });
    } catch (error) {
        console.error("Failed to resolve Mai eligibility:", error);
        return Response.json({ error: "Failed to determine Mai eligibility" }, { status: 500 });
    }
}
