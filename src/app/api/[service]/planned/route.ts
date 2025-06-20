import { getSession } from "~/lib/session";
import type { PlannedItem } from "~/lib/types";

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
        const formattedItems: PlannedItem[] = [];
        while (true) {
            const data = await fetch(`https://api.myanimelist.net/v2/users/@me/animelist?status=plan_to_watch&limit=100&offset=${formattedItems.length}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${session.accessToken}`,
                },
            });

            if (!data.ok) {
                return new Response("Failed to fetch planned items", { status: 500 });
            }

            const plannedItems = await data.json();

            if (!plannedItems.data || plannedItems.data.length === 0) {
                break;
            }

            for (const item of plannedItems.data) {
                const anime = item.node;
                formattedItems.push({
                    id: anime.id,
                    title: anime.title,
                    imageMal: {
                        medium: anime.main_picture?.medium || null,
                        large: anime.main_picture?.large || null,
                    },
                });
            }
        }
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
query Planned($userName: String, $statusIn: [MediaListStatus], $type: MediaType) {
  MediaListCollection(userName: $userName, status_in: $statusIn, type: $type) {
    lists {
      entries {
        id
        media {
          averageScore
          episodes
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
          siteUrl
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
            (item: {
                id: number;
                media: {
                    siteUrl: string;
                    episodes: number;
                    averageScore: number;
                    title: { english: string; romaji: string; native: string };
                    coverImage: { extraLarge: string; large: string; medium: string };
                    startDate?: { day: number; month: number; year: number };
                    nextAiringEpisode?: { airingAt: number; timeUntilAiring: number };
                };
            }) => ({
                id: item.id,
                title: item.media.title.english || item.media.title.romaji,
                romajiTitle: item.media.title.romaji,
                image: {
                    extraLarge: item.media.coverImage.extraLarge,
                    large: item.media.coverImage.large,
                    medium: item.media.coverImage.medium,
                },
                nativeTitle: item.media.title.native,
                startDate: item.media.startDate,
                nextAiringEpisode: item.media.nextAiringEpisode,
                episodes: item.media.episodes,
                averageScore: item.media.averageScore,
                siteUrl: item.media.siteUrl,
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
