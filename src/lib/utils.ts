import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useSettingsStore } from "~/lib/store";
import type { AniListMediaItem, ImageSize, MALMediaItem, MediaItem, TitleLanguage, UserProfile } from "~/lib/types";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

// Cached versions to avoid repeated store calls
export const getTitleWithPreference = (media: MediaItem, preferredLanguage?: TitleLanguage) => {
    const lang = preferredLanguage || useSettingsStore.getState().preferredTitleLanguage;
    return media.title[lang] || media.title.romaji || media.title.jp || "[Unknown Title]";
};

export const getImageUrlWithPreference = (media: MediaItem, size?: ImageSize, preferredSize?: ImageSize) => {
    const sizeToUse = size || preferredSize || useSettingsStore.getState().preferredImageSize;
    return media.image[sizeToUse] || media.image.large || media.image.medium || "/placeholder.webp";
};

export function aniListToMediaItem(item: AniListMediaItem): MediaItem {
    return {
        id: item.id,
        title: {
            en: item.title.english || null,
            romaji: item.title.romaji,
            jp: item.title.native || null,
        },
        image: {
            extraLarge: item.coverImage.extraLarge || null,
            large: item.coverImage.large || null,
            medium: item.coverImage.medium || "/placeholder.webp",
        },
        startDate: item.startDate && (item.startDate.year || item.startDate.month || item.startDate.day) ? new Date(`${item.startDate.year}-${`0${item.startDate.month}`.slice(-2)}-${`0${item.startDate.day}`.slice(-2)}T00:00:00Z`) : null,
        averageScore: Number.isFinite(item.averageScore) ? (item.averageScore as number) / 10 : null,
        episodes: item.episodes || 0,
        siteUrl: item.siteUrl || `https://anilist.co/anime/${item.id}`,
        genres: item.genres || [],
        entryCreatedAt: item.mediaListEntry?.createdAt || null,
        status: item.mediaListEntry?.status || null,
        format: item.format || "UNKNOWN",
        duration: item.duration || 0,
    };
}

export function malToMediaItem(item: MALMediaItem): MediaItem {
    return {
        id: item.id,
        title: {
            en: item.alternative_titles?.en || null,
            romaji: item.title,
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
        status: item.my_list_status?.status === "plan_to_watch" ? "PLANNING" : item.my_list_status?.status === "dropped" ? "DROPPED" : item.my_list_status?.status === "on_hold" ? "PAUSED" : null,
        format: item.media_type === "tv" ? "TV" : item.media_type === "ova" ? "OVA" : item.media_type === "movie" ? "MOVIE" : item.media_type === "special" ? "SPECIAL" : item.media_type === "ona" ? "ONA" : item.media_type === "music" ? "MUSIC" : item.media_type === "unknown" ? "UNKNOWN" : "UNKNOWN",
        duration: Number(((item.average_episode_duration || 0) / 60).toFixed()),
    };
}

export function getPrettyProviderName(provider: UserProfile["provider"]) {
    const providers = { anilist: "AniList", myanimelist: "MyAnimeList" };
    return providers[provider];
}
