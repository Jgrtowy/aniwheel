import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export interface PlannedItem {
    id: number;
    title: string;
    image?: string;
}

export async function GET(request: Request, { params }: { params: Promise<{ service: string }> }) {
    const { service } = await params;
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return new Response("Unauthorized", { status: 401 });
    }
    if (!service) {
        return new Response("Service not specified", { status: 400 });
    }

    if (service === "myanimelist") {
        const data = await fetch("https://api.myanimelist.net/v2/users/@me/animelist?status=plan_to_watch&limit=100", {
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
        const data = await fetch("https://graphql.anilist.co", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.accessToken}`,
            },
            body: JSON.stringify({
                query: `
query ($userName: String, $statusIn: [MediaListStatus]) {
  MediaList(userName: $userName, status_in: $statusIn) {
    id
    media {
      title {
        english
        romaji
      }
      coverImage {
        extraLarge
        large
        medium
      }
    }
  }
}
                `,
                variables: {
                    userName: session.user.name,
                    statusIn: ["PLANNING"],
                },
            }),
        });
        if (!data.ok) {
            return new Response("Failed to fetch planned items", { status: 500 });
        }

        const mediaList = (await data.json()).data.MediaList;
        console.log(mediaList);

        const formattedMediaList: PlannedItem[] = mediaList.map((item: { id: number; media: { title: { english: string; romaji: string }; coverImage: { extraLarge: string; large: string; medium: string } } }) => ({
            id: item.id,
            title: item.media.title.english || item.media.title.romaji,
            image: item.media.coverImage.extraLarge || item.media.coverImage.large || item.media.coverImage.medium,
        }));
        return new Response(JSON.stringify(formattedMediaList), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }
    return new Response("Service not supported", { status: 400 });
}
