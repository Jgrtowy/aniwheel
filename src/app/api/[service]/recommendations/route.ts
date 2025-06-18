import { getSession } from "~/lib/session";
import type { PlannedItem } from "~/lib/types";

export interface Recommendations {
    id: number;
    media: PlannedItem;
    mediaRecommendation: PlannedItem;
    rating: number;
}

export async function GET(request: Request, { params }: { params: Promise<{ service: string }> }) {
    const { service } = await params;

    const session = await getSession();

    if (!session.isAuthenticated) {
        return new Response("Unauthorized", { status: 401 });
    }
    if (!service) {
        return new Response("Service not specified", { status: 400 });
    }
    if (service !== "anilist") {
        return new Response("Service not supported", { status: 400 });
    }
    if (!session.accessToken) {
        return new Response("Access token not found", { status: 401 });
    }

    const data = await fetch("https://graphql.anilist.co", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({
            query: `
query Recommendations($onList: Boolean, $sort: [RecommendationSort], $page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    recommendations(onList: $onList, sort: $sort) {
      id
      media {
        id
        siteUrl
        coverImage {
          extraLarge
          large
          medium
        }
        title {
          english
          native
          romaji
        }
        averageScore
        episodes
      }
      mediaRecommendation {
        id
        siteUrl
        coverImage {
          extraLarge
          large
          medium
        }
        title {
          english
          native
          romaji
        }
        averageScore
        episodes
      }
      rating
    }
  }
}

                `,
            variables: {
                onList: false,
                sort: "RATING_DESC",
                page: 2,
                perPage: 10,
            },
        }),
    });

    if (!data.ok) {
        return new Response("Failed to fetch planned items", { status: 500 });
    }

    const mediaList = (await data.json()).data.Page.recommendations;

    const formattedList: Recommendations[] = mediaList.map(
        (item: {
            id: number;
            media: PlannedItem & { title: { romaji: string; native: string; english: string }; coverImage: { extraLarge?: string; large?: string; medium?: string } };
            mediaRecommendation: PlannedItem & { title: { romaji: string; native: string; english: string }; coverImage: { extraLarge?: string; large?: string; medium?: string } };
        }) => ({
            id: item.id,
            media: {
                id: item.media.id,
                title: item.media.title.english || item.media.title.romaji || item.media.title.native,
                romajiTitle: item.media.title.romaji,
                image: item.media.coverImage.extraLarge || item.media.coverImage.large || item.media.coverImage.medium,
                nativeTitle: item.media.title.native,
                averageScore: item.media.averageScore,
                episodes: item.media.episodes,
                siteUrl: item.media.siteUrl,
            },
            mediaRecommendation: {
                id: item.mediaRecommendation.id,
                title: item.mediaRecommendation.title.english || item.mediaRecommendation.title.romaji || item.mediaRecommendation.title.native,
                romajiTitle: item.mediaRecommendation.title.romaji,
                image: item.mediaRecommendation.coverImage.extraLarge || item.mediaRecommendation.coverImage.large || item.mediaRecommendation.coverImage.medium,
                nativeTitle: item.mediaRecommendation.title.native,
                averageScore: item.mediaRecommendation.averageScore,
                episodes: item.mediaRecommendation.episodes,
                siteUrl: item.mediaRecommendation.siteUrl,
            },
        }),
    );
    return new Response(JSON.stringify(formattedList), {
        status: 200,
        headers: {
            "Content-Type": "application/json",
        },
    });
}
