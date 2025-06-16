import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export interface PlannedItem {
    id: number;
    title: string;
    image?: string;
    romajiTitle?: string;
    nativeTitle?: string;
    startDate?: { day: number; month: number; year: number };
    nextAiringEpisode?: { airingAt: number; timeUntilAiring: number };
}

export async function POST(request: Request, { params }: { params: Promise<{ service: string }> }) {
    const { service } = await params;
    const body = await request.json();

    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return new Response("Unauthorized", { status: 401 });
    }
    if (!service) {
        return new Response("Service not specified", { status: 400 });
    }
    if (service !== "myanimelist" && service !== "anilist") {
        return new Response("Service not supported", { status: 400 });
    }
    if (!session.accessToken) {
        return new Response("Access token not found", { status: 401 });
    }
    if (!body.title) {
        return new Response("Search query or type not provided", { status: 400 });
    }

    if (service === "myanimelist") {
        return new Response("MyAnimeList search is not supported!", {
            status: 400,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }

    if (service === "anilist") {
        const data = await fetch("https://graphql.anilist.co", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.accessToken}`,
            },
            body: JSON.stringify({
                query: `
query ($search: String, $type: MediaType) {
  Media(search: $search, type: $type) {
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
          nextAiringEpisode {
            airingAt
            timeUntilAiring
          }
        }
      }
                `,
                variables: {
                    search: body.title.toString() ?? "",
                    type: "ANIME",
                },
            }),
        });

        if (!data.ok) {
            return new Response("Failed to fetch planned items", { status: 500 });
        }

        const mediaList = (await data.json()).data.Media;

        const formattedMediaList: PlannedItem = {
            id: mediaList.id,
            title: mediaList.title.english || mediaList.title.romaji,
            romajiTitle: mediaList.title.romaji,
            image: mediaList.coverImage.extraLarge || mediaList.coverImage.large || mediaList.coverImage.medium,
            nativeTitle: mediaList.title.native,
            startDate: mediaList.startDate,
            nextAiringEpisode: mediaList.nextAiringEpisode,
        };
        return new Response(JSON.stringify(formattedMediaList), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }
    return new Response("Service not supported", { status: 400 });
}
