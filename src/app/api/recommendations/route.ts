import type { AniListMediaRecommendation, MediaRecommendation } from "~/lib/types";
import { aniListToMediaItem } from "~/lib/utils";
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
query Recommendations($onList: Boolean, $sort: [RecommendationSort], $page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    recommendations(onList: $onList, sort: $sort) {
      id
      rating
      media {
        id
        title {
          english
          native
          romaji
        }
        coverImage {
          extraLarge
          large
          medium
        }
        startDate {
          day
          month
          year
        }
        endDate {
          day
          month
          year
        }
        averageScore
        episodes
        siteUrl
        genres
        format
        duration
        status(version: 2)
        studios {
          edges {
            isMain
            node {
              name
            }
          }
        }
        type
      }
      mediaRecommendation {
        id
        title {
          english
          native
          romaji
        }
        coverImage {
          extraLarge
          large
          medium
        }
        startDate {
          day
          month
          year
        }
        endDate {
          day
          month
          year
        }
        averageScore
        episodes
        siteUrl
        genres
        format
        duration
        status(version: 2)
        studios {
          edges {
            isMain
            node {
              name
            }
          }
        }
        type
      }
    }
  }
}
`,
                variables: {
                    onList: true,
                    sort: "RATING_DESC",
                    page: 1,
                    perPage: 50,
                },
            }),
        });

        if (!data.ok) return Response.json({ error: "Failed to fetch recommendations from AniList" }, { status: 500 });

        const response = await data.json();
        const mediaList = response.data.Page.recommendations as AniListMediaRecommendation[];

        const formattedMediaList: MediaRecommendation[] = mediaList.map(({ id, rating, media, mediaRecommendation }) => ({
            id,
            rating,
            media: aniListToMediaItem({ ...media, mediaListEntry: null }),
            mediaRecommendation: aniListToMediaItem({ ...mediaRecommendation, mediaListEntry: null }),
        }));

        const filteredMediaList = formattedMediaList.filter((rec) => rec.media.type === "ANIME" && rec.mediaRecommendation.type === "ANIME");

        return Response.json(filteredMediaList, { status: 200 });
    }

    return Response.json({ error: "Service not supported" }, { status: 400 });
}
