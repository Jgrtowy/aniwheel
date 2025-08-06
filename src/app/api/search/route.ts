import type { AniListMediaItem, MALMediaItem, MediaItem } from "~/lib/types";
import { aniListToMediaItem, malToMediaItem } from "~/lib/utils";
import { getServerSession } from "~/server/auth";

export async function POST(request: Request) {
    const session = await getServerSession();
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    if (!body.query) return Response.json({ error: "Search query not provided" }, { status: 400 });

    if (session.activeProvider === "anilist") {
        if (!session.accessToken) return Response.json({ error: "AniList access token not available" }, { status: 401 });

        const data = await fetch("https://graphql.anilist.co", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.accessToken}` },
            body: JSON.stringify({
                query: `
query Search($search: String, $type: MediaType, $perPage: Int) {
  Page(page: 1, perPage: $perPage) {
    media(search: $search, type: $type) {
      id
      title {
        english
        romaji
        native
      }
      coverImage {
        medium
        large
        extraLarge
      }
      startDate {
        day
        month
        year
      }
      averageScore
      episodes
      siteUrl
      genres
    }
  }
}
`,
                variables: {
                    search: body.query.toString(),
                    type: "ANIME",
                    perPage: 10,
                },
            }),
        });

        if (!data.ok) return Response.json({ error: "Failed to search anime on AniList" }, { status: 500 });

        const response = await data.json();
        const mediaList = response.data.Page.media as AniListMediaItem[];

        const formattedMediaList: MediaItem[] = mediaList.map((item: AniListMediaItem) => aniListToMediaItem(item));

        return Response.json(formattedMediaList, { status: 200 });
    }

    if (session.activeProvider === "myanimelist") {
        if (!session.accessToken) return Response.json({ error: "MyAnimeList access token not available" }, { status: 401 });

        const data = await fetch(`https://api.myanimelist.net/v2/anime?q=${encodeURIComponent(body.query)}&limit=10&fields=alternative_titles,start_date,mean,num_episodes,genres,my_list_status`, {
            method: "GET",
            headers: { Authorization: `Bearer ${session.accessToken}` },
        });

        if (!data.ok) return Response.json({ error: "Failed to search anime on MyAnimeList" }, { status: 500 });

        const response = await data.json();
        const mediaList = response.data as { node: MALMediaItem }[];

        const formattedMediaList: MediaItem[] = mediaList.map((item: { node: MALMediaItem }) => malToMediaItem(item.node));

        return Response.json(formattedMediaList, { status: 200 });
    }

    return new Response("Service not supported", { status: 400 });
}
