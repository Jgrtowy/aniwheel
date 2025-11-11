import { getServerSession } from "~/server/auth";

type AniListStatus = "PLANNING" | "CURRENT" | "COMPLETED" | "DROPPED" | "PAUSED" | "REPEATING";
type MALStatus = "watching" | "completed" | "on_hold" | "dropped" | "plan_to_watch";

const aniListStatusMap: Record<string, AniListStatus> = {
    planning: "PLANNING",
    watching: "CURRENT",
    current: "CURRENT",
    completed: "COMPLETED",
    dropped: "DROPPED",
    paused: "PAUSED",
    on_hold: "PAUSED",
    repeating: "REPEATING",
};

const malStatusMap: Record<string, MALStatus> = {
    planning: "plan_to_watch",
    plan_to_watch: "plan_to_watch",
    watching: "watching",
    current: "watching",
    completed: "completed",
    dropped: "dropped",
    paused: "on_hold",
    on_hold: "on_hold",
};

export async function PUT(request: Request) {
    const session = await getServerSession();
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    let { animeIds, status } = body;

    if (!animeIds || (Array.isArray(animeIds) && animeIds.length === 0)) return Response.json({ error: "No anime IDs provided" }, { status: 400 });

    if (!status) return Response.json({ error: "No status provided" }, { status: 400 });

    if (!Array.isArray(animeIds)) animeIds = [animeIds];

    const normalizedStatus = status.toLowerCase().trim();

    if (session.activeProvider === "anilist") {
        if (!session.accessToken) return Response.json({ error: "AniList access token not available" }, { status: 401 });

        const aniListStatus = aniListStatusMap[normalizedStatus];
        if (!aniListStatus) return Response.json({ error: `Invalid status. Allowed values: ${Object.keys(aniListStatusMap).join(", ")}` }, { status: 400 });

        const results = [];
        const errors = [];

        for (const animeId of animeIds) {
            try {
                const response = await fetch("https://graphql.anilist.co", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.accessToken}` },
                    body: JSON.stringify({
                        query: `
mutation ($mediaId: Int, $status: MediaListStatus) {
    SaveMediaListEntry(mediaId: $mediaId, status: $status) {
        id
        status
    }
}
`,
                        variables: { mediaId: animeId, status: aniListStatus },
                    }),
                });

                if (response.ok) {
                    const result = await response.json();
                    if (result.errors) errors.push({ animeId, error: result.errors[0].message });
                    else results.push({ animeId, success: true });
                } else {
                    errors.push({ animeId, error: `HTTP ${response.status}: ${response.statusText}` });
                }
            } catch (error) {
                errors.push({ animeId, error: error instanceof Error ? error.message : "Unknown error" });
            }
        }

        return Response.json(
            {
                success: results.length,
                errors: errors.length,
                results,
                errorDetails: errors,
            },
            {
                status: errors.length > 0 && results.length === 0 ? 500 : 200,
                headers: { "Content-Type": "application/json" },
            },
        );
    }

    if (session.activeProvider === "myanimelist") {
        if (!session.accessToken) return Response.json({ error: "MyAnimeList access token not available" }, { status: 401 });

        const malStatus = malStatusMap[normalizedStatus];
        if (!malStatus) return Response.json({ error: `Invalid status. Allowed values: ${Object.keys(malStatusMap).join(", ")}` }, { status: 400 });

        const results = [];
        const errors = [];

        for (const animeId of animeIds) {
            try {
                const response = await fetch(`https://api.myanimelist.net/v2/anime/${animeId}/my_list_status`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/x-www-form-urlencoded", Authorization: `Bearer ${session.accessToken}` },
                    body: new URLSearchParams({ status: malStatus }),
                });

                if (response.ok) {
                    results.push({ animeId, success: true });
                } else {
                    const errorText = await response.text();
                    errors.push({ animeId, error: `HTTP ${response.status}: ${errorText}` });
                }
            } catch (error) {
                errors.push({ animeId, error: error instanceof Error ? error.message : "Unknown error" });
            }
        }

        return Response.json(
            {
                success: results.length,
                errors: errors.length,
                results,
                errorDetails: errors,
            },
            {
                status: errors.length > 0 && results.length === 0 ? 500 : 200,
                headers: { "Content-Type": "application/json" },
            },
        );
    }

    return Response.json({ error: "Service not supported" }, { status: 400 });
}
