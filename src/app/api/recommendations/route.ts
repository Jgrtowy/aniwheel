import type { NextRequest } from "next/server";
import type { AniListMediaRecommendation, MediaRecommendation } from "~/lib/types";
import { aniListToMediaItem } from "~/lib/utils";
import { getServerSession } from "~/server/auth";

export async function GET(request: NextRequest) {
    const session = await getServerSession();
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const searchParams = request.nextUrl.searchParams;
    const page = Number.parseInt(searchParams.get("page") || "1", 10);

    if (session.activeProvider === "anilist") {
        if (!session.accessToken) return Response.json({ error: "AniList access token not available" }, { status: 401 });

        const data = await fetch("https://graphql.anilist.co", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.accessToken}` },
            body: JSON.stringify({
                query: `
query Recommendations($onList: Boolean, $sort: [RecommendationSort], $page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    pageInfo {
      currentPage
      hasNextPage
      lastPage
      perPage
      total
    }
    recommendations(onList: $onList, sort: $sort) {
      id
      rating
      media {
        id
        type
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
        endDate {
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
          customLists
        }
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
        trailer {
          id
          site
        }
        description
        season
        seasonYear
        externalLinks {
          site
          type
          url
          language
          notes
          icon
          color
        }
      }
      mediaRecommendation {
        id
        type
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
        endDate {
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
          customLists
        }
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
        trailer {
          id
          site
        }
        description
        season
        seasonYear
        externalLinks {
          site
          type
          url
          language
          notes
          icon
          color
        }
      }
    }
  }
}
`,
                variables: {
                    onList: true,
                    sort: "RATING_DESC",
                    page,
                    perPage: 50,
                },
            }),
        });

        if (!data.ok) return Response.json({ error: "Failed to fetch recommendations from AniList" }, { status: 500 });

        const response = await data.json();
        const mediaList = response.data.Page.recommendations as AniListMediaRecommendation[];
        const pageInfo = response.data.Page.pageInfo;

        const formattedMediaList: MediaRecommendation[] = mediaList.map(({ id, rating, media, mediaRecommendation }) => ({
            id,
            rating,
            media: aniListToMediaItem({ ...media, mediaListEntry: null }),
            mediaRecommendation: aniListToMediaItem({ ...mediaRecommendation, mediaListEntry: null }),
        }));

        const filteredMediaList = formattedMediaList.filter((rec) => rec.media.type === "ANIME" && rec.mediaRecommendation.type === "ANIME");

        return Response.json({ data: filteredMediaList, pageInfo }, { status: 200 });
    }

    return Response.json({ error: "Service not supported" }, { status: 400 });
}
