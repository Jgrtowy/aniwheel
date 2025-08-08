import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useSettingsStore } from "~/lib/store";
import type { AniListMediaItem, ImageSize, MALMediaItem, MediaItem, UserProfile } from "~/lib/types";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const getTitleWithPreference = (media: MediaItem) => media.title[useSettingsStore.getState().preferredTitleLanguage] || media.title.romaji || media.title.jp || "[Unknown Title]";
export const getImageUrlWithPreference = (media: MediaItem, size?: ImageSize) => media.image[size || useSettingsStore.getState().preferredImageSize] || media.image.large || media.image.medium || "/placeholder.webp";

export function aniListToMediaItem(item: AniListMediaItem): MediaItem {
    return {
        id: item.id,
        title: {
            en: item.title.english || null,
            romaji: item.title.romaji || "Unknown Title",
            jp: item.title.native || null,
        },
        image: {
            extraLarge: item.coverImage.extraLarge || null,
            large: item.coverImage.large || null,
            medium: item.coverImage.medium || "/placeholder.webp",
        },
        startDate: item.startDate?.day && item.startDate?.month && item.startDate?.year ? new Date(`${item.startDate.year}-${`0${item.startDate.month}`.slice(-2)}-${`0${item.startDate.day}`.slice(-2)}T00:00:00Z`) : null,
        averageScore: Number.isFinite(item.averageScore) ? (item.averageScore as number) / 10 : null,
        episodes: item.episodes || 0,
        siteUrl: item.siteUrl || `https://anilist.co/anime/${item.id}`,
        genres: item.genres || [],
        entryCreatedAt: item.mediaListEntry?.createdAt || null,
        isCustom: false,
        status: item.status || "UNKNOWN",
    };
}

export function malToMediaItem(item: MALMediaItem): MediaItem {
    return {
        id: item.id,
        title: {
            en: item.alternative_titles?.en || null,
            romaji: item.title || "Unknown Title",
            jp: item.alternative_titles?.ja || null,
        },
        image: {
            extraLarge: null,
            large: item.main_picture?.large || null,
            medium: item.main_picture?.medium || "/placeholder.webp",
        },
        startDate: item.start_date ? new Date(item.start_date) : null,
        averageScore: item.mean || null,
        episodes: item.num_episodes || 0,
        siteUrl: `https://myanimelist.net/anime/${item.id}`,
        genres: item.genres?.map((genre: { name: string }) => genre.name) || [],
        entryCreatedAt: item.my_list_status?.updated_at ? new Date(item.my_list_status.updated_at).getTime() : null,
        isCustom: false,
        status: item.my_list_status?.status || "UNKNOWN",
    };
}

export function getPrettyProviderName(provider: UserProfile["provider"]) {
    const providers = { anilist: "AniList", myanimelist: "MyAnimeList" };
    return providers[provider];
}
