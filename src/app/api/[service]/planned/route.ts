import { getServerSession } from "next-auth";
import { getSession } from "~/lib/session";
import type { PlannedItem } from "~/lib/types";
import { authOptions } from "~/server/auth";

export async function GET(request: Request, { params }: { params: Promise<{ service: string }> }) {
    const { service } = await params;
    const session = await getSession();

    if (!session.isAuthenticated) {
        return new Response("Unauthorized", { status: 401 });
    }
    if (!service) {
        return new Response("Service not specified", { status: 400 });
    }

    if (service === "myanimelist") {
        if (!session.accessToken) {
            return new Response("Access token not available", { status: 401 });
        }

        const data = await fetch("https://api.myanimelist.net/v2/users/@me/animelist?status=plan_to_watch", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${session.accessToken}`,
            },
        });

        if (!data.ok) {
            return new Response("Failed to fetch planned items", { status: 500 });
        }

        const plannedItems = await data.json();

        const formattedItems: PlannedItem[] = plannedItems.data.map((item: { node: { title: string; id: string; main_picture: { medium: string; large: string } } }) => ({
            id: item.node.id,
            title: item.node.title,
            image: item.node.main_picture ? (item.node.main_picture.large ? item.node.main_picture.large : item.node.main_picture.medium) : undefined,
        }));
        return new Response(JSON.stringify(formattedItems), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }

    if (service === "anilist") {
        if (!session.accessToken || !session.userName) {
            return new Response("Access token or username not available", { status: 401 });
        }

        const data = await fetch("https://graphql.anilist.co", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.accessToken}`,
            },
            body: JSON.stringify({
                query: `
query ($userName: String, $statusIn: [MediaListStatus], $type: MediaType) {
  MediaListCollection(userName: $userName, status_in: $statusIn, type: $type) {
    lists {
      entries {
        id
        media {
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
    }
  }
}


                `,
                variables: {
                    userName: session.userName,
                    statusIn: ["PLANNING"],
                    type: "ANIME",
                },
            }),
        });
        if (!data.ok) {
            return new Response("Failed to fetch planned items", { status: 500 });
        }

        const mediaList = (await data.json()).data.MediaListCollection.lists[0].entries;

        const formattedMediaList: PlannedItem[] = mediaList.map(
            (item: { id: number; media: { title: { english: string; romaji: string; native: string }; coverImage: { extraLarge: string; large: string; medium: string }; startDate?: { day: number; month: number; year: number }; nextAiringEpisode?: { airingAt: number; timeUntilAiring: number } } }) => ({
                id: item.id,
                title: item.media.title.english || item.media.title.romaji,
                romajiTitle: item.media.title.romaji,
                image: item.media.coverImage.extraLarge || item.media.coverImage.large || item.media.coverImage.medium,
                nativeTitle: item.media.title.native,
                startDate: item.media.startDate,
                nextAiringEpisode: item.media.nextAiringEpisode,
            }),
        );
        return new Response(JSON.stringify(formattedMediaList), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }
    return new Response("Service not supported", { status: 400 });
}
