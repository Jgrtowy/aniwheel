import type { AniListMediaItem, MALMediaItem, MediaItem } from "~/lib/types";
import { aniListToMediaItem, malToMediaItem } from "~/lib/utils";
import { getServerSession } from "~/server/auth";

export async function GET() {
    const session = await getServerSession();
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    if (session.activeProvider === "anilist") {
        if (!session.accessToken) return Response.json({ error: "AniList access token not available" }, { status: 401 });

        const data = await fetch("https://graphql.anilist.co", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.accessToken}` },
            body: JSON.stringify({
                query: `
query MediaList($userName: String, $statusIn: [MediaListStatus], $type: MediaType) {
  MediaListCollection(userName: $userName, status_in: $statusIn, type: $type) {
    lists {
      entries {
        media {
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
          mediaListEntry {
            createdAt
            status
          }
          format
        }
      }
    }
  }
}
`,
                variables: { userName: session.user.name, statusIn: ["PLANNING", "DROPPED", "PAUSED"], type: "ANIME" },
            }),
        });
        if (!data.ok) return Response.json({ error: "Failed to fetch planned items from AniList" }, { status: 500 });

        const response = await data.json();
        const mediaList = response.data.MediaListCollection.lists.flatMap((list: { entries: { media: AniListMediaItem }[] }) => list.entries) as { media: AniListMediaItem }[];

        const formattedMediaList: MediaItem[] = mediaList.map((item: { media: AniListMediaItem }) => aniListToMediaItem(item.media));

        return Response.json(formattedMediaList, { status: 200 });
    }

    if (session.activeProvider === "myanimelist") {
        if (!session.accessToken) return Response.json({ error: "MyAnimeList access token not available" }, { status: 401 });

        const formattedMediaList: MediaItem[] = [];

        const data = await fetch(`https://api.myanimelist.net/v2/users/@me/animelist?limit=1000&offset=${formattedMediaList.length}&fields=alternative_titles,start_date,mean,num_episodes,genres,my_list_status,media_type`, {
            method: "GET",
            headers: { Authorization: `Bearer ${session.accessToken}` },
        });

        if (!data.ok) return Response.json({ error: "Failed to fetch planned items from MyAnimeList" }, { status: 500 });

        const response = (await data.json()) as { data: { node: MALMediaItem }[] };

        const mediaList = response.data;

        for (const _item of mediaList) {
            const item: MALMediaItem = _item.node;
            if (!(item.my_list_status?.status === "plan_to_watch" || item.my_list_status?.status === "dropped" || item.my_list_status?.status === "on_hold")) continue;

            formattedMediaList.push(malToMediaItem(item));
        }

        return Response.json(formattedMediaList, { status: 200 });
    }

    return Response.json({ error: "Service not supported" }, { status: 400 });
}
