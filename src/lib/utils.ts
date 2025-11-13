import { type ClassValue, clsx } from "clsx";
import type { Session } from "next-auth";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";
import type { AniListMediaItem, ImageSize, MALMediaItem, MediaDate, MediaItem, TitleLanguage, UserProfile } from "~/lib/types";
import { useAnimeStore } from "~/store/anime";
import { useSettingsStore } from "~/store/settings";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const getTitleWithPreference = (media: MediaItem, preferredLanguage?: TitleLanguage) => {
    const lang = preferredLanguage || useSettingsStore.getState().preferredTitleLanguage;
    return media.title[lang] || media.title.romaji || media.title.jp || "[Unknown Title]";
};

export const getImageUrlWithPreference = (media: MediaItem, size?: ImageSize, preferredSize?: ImageSize) => {
    const sizeToUse = size || preferredSize || useSettingsStore.getState().preferredImageSize;
    return media.image[sizeToUse] || media.image.large || media.image.medium || "/placeholder.webp";
};

export const convertAniListDate = (date: AniListMediaItem["startDate"]): MediaDate | null => {
    if (!date || !date.year) return null;

    return {
        year: Number.isFinite(date.year) ? date.year : null,
        month: typeof date.month === "number" && Number.isFinite(date.month) ? date.month : null,
        day: typeof date.day === "number" && Number.isFinite(date.day) ? date.day : null,
    };
};

const MAL_DATE_PATTERN = /^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/;

export const parseMalDate = (value: string | null): MediaDate | null => {
    if (!value) return null;

    const match = value.match(MAL_DATE_PATTERN);
    if (!match) return null;

    const [, year, month, day] = match;
    const parsedYear = Number.parseInt(year ?? "", 10);
    if (!Number.isFinite(parsedYear)) return null;

    const parsedMonth = month ? Number.parseInt(month, 10) : null;
    const parsedDay = day ? Number.parseInt(day, 10) : null;

    return {
        year: parsedYear,
        month: typeof parsedMonth === "number" && Number.isFinite(parsedMonth) ? parsedMonth : null,
        day: typeof parsedDay === "number" && Number.isFinite(parsedDay) ? parsedDay : null,
    };
};

export const mediaDateToDate = (date: MediaDate | null, options: { useEndOfRange?: boolean } = {}): Date | null => {
    if (!date || !date.year) return null;

    const useEnd = options.useEndOfRange ?? false;
    const normalizedMonth = date.month ?? (useEnd ? 12 : 1);
    const safeMonth = Math.min(12, Math.max(1, normalizedMonth));
    const fallbackDay = useEnd ? new Date(Date.UTC(date.year, safeMonth, 0)).getUTCDate() : 1;
    const normalizedDay = date.day ?? fallbackDay;
    const safeDay = Math.min(31, Math.max(1, normalizedDay));

    const parsedDate = new Date(Date.UTC(date.year, safeMonth - 1, safeDay));
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

export const mediaDateToTimestamp = (date: MediaDate | null, options: { useEndOfRange?: boolean } = {}) => {
    const parsedDate = mediaDateToDate(date, options);
    return parsedDate ? parsedDate.getTime() : null;
};

export const formatCustomLists = (lists: { [key: string]: boolean }): string[] | null => {
    const formattedLists: string[] = [];
    if (!lists || Object.keys(lists).length === 0) return null;
    for (const list of Object.keys(lists)) {
        if (lists[list]) formattedLists.push(list);
    }
    return formattedLists;
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
        startDate: convertAniListDate(item.startDate),
        endDate: convertAniListDate(item.endDate),
        averageScore: Number.isFinite(item.averageScore) ? (item.averageScore as number) / 10 : null,
        episodes: item.episodes || 0,
        siteUrl: item.siteUrl || `https://anilist.co/anime/${item.id}`,
        genres: item.genres || [],
        entryCreatedAt: item.mediaListEntry?.createdAt ? item.mediaListEntry.createdAt * 1000 : null,
        status: item.mediaListEntry?.status || null,
        format: item.format || "UNKNOWN",
        duration: item.duration || 0,
        studios: item.studios?.edges.map((edge) => ({ name: edge.node.name, isMain: edge.isMain })) || [],
        releasingStatus: item.status || null,
        trailer: item.trailer ? { site: item.trailer.site, id: item.trailer.id } : null,
        description: item.description || null,
        customLists: formatCustomLists(item.mediaListEntry?.customLists || {}),
        startSeason: { season: item.season, year: item.seasonYear },
        externalLinks: item.externalLinks,
    };
}

const malStatusToReleasingStatus: Record<Exclude<MALMediaItem["status"], null>, MediaItem["releasingStatus"]> = {
    finished_airing: "FINISHED",
    currently_airing: "RELEASING",
    not_yet_aired: "NOT_YET_RELEASED",
    cancelled: "CANCELLED",
    on_hiatus: "HIATUS",
};

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
        startDate: parseMalDate(item.start_date),
        endDate: parseMalDate(item.end_date),
        averageScore: item.mean || null,
        episodes: item.num_episodes || 0,
        siteUrl: `https://myanimelist.net/anime/${item.id}`,
        genres: item.genres?.map((genre: { name: string }) => genre.name) || [],
        entryCreatedAt: item.my_list_status?.updated_at ? new Date(item.my_list_status.updated_at).getTime() : null,
        status: item.my_list_status?.status === "plan_to_watch" ? "PLANNING" : item.my_list_status?.status === "dropped" ? "DROPPED" : item.my_list_status?.status === "on_hold" ? "PAUSED" : null,
        format: item.media_type === "tv" ? "TV" : item.media_type === "ova" ? "OVA" : item.media_type === "movie" ? "MOVIE" : item.media_type === "special" ? "SPECIAL" : item.media_type === "ona" ? "ONA" : item.media_type === "music" ? "MUSIC" : item.media_type === "unknown" ? "UNKNOWN" : "UNKNOWN",
        duration: Math.round((item.average_episode_duration || 0) / 60),
        studios: item.studios?.map((studio) => ({ name: studio.name, isMain: true })) || [],
        releasingStatus: item.status ? malStatusToReleasingStatus[item.status] || null : null,
        trailer: null,
        description: item.synopsis || null,
        customLists: [],
        startSeason: { season: (item.start_season?.season?.toUpperCase() as Uppercase<NonNullable<MALMediaItem["start_season"]>["season"]> | null) || null, year: item.start_season?.year || null },
        externalLinks: null,
    };
}

export function getPrettyProviderName(provider: UserProfile["provider"]) {
    const providers = { anilist: "AniList", myanimelist: "MyAnimeList" };
    return providers[provider];
}

const mediaFormatLabels: Record<MediaItem["format"], string> = {
    TV: "TV",
    TV_SHORT: "TV Short",
    MOVIE: "Movie",
    SPECIAL: "Special",
    OVA: "OVA",
    ONA: "ONA",
    MUSIC: "Music",
    UNKNOWN: "Unknown Format",
};

const releasingStatusLabels: Record<NonNullable<MediaItem["releasingStatus"]>, string> = {
    FINISHED: "Finished",
    RELEASING: "Releasing",
    NOT_YET_RELEASED: "Not Yet Released",
    CANCELLED: "Cancelled",
    HIATUS: "Hiatus",
};
const releasingStatusDescriptions: Record<NonNullable<MediaItem["releasingStatus"]>, string> = {
    FINISHED: "Has completed and is no longer being released",
    RELEASING: "Currently releasing",
    NOT_YET_RELEASED: "To be released at a later date",
    CANCELLED: "Ended before the work could be finished",
    HIATUS: "Is currently paused from releasing and will resume at a later date",
};

export const getPrettyMediaFormat = (format: MediaItem["format"]) => mediaFormatLabels[format] || "Unknown Format";

export const getPrettyReleasingStatus = (status: MediaItem["releasingStatus"]) => (status ? releasingStatusLabels[status] || "Unknown Status" : "Unknown Status");
export const getReleasingStatusDescription = (status: MediaItem["releasingStatus"]) => (status ? releasingStatusDescriptions[status] || "No releasing status has been provided" : "No releasing status has been provided");

type AiringDateInfo = { isRange: true; label: { from: string; to: string } } | { isRange: false; label: { from: string | null; to: string | null } };
export const getAiringDateInfo = (anime: MediaItem): AiringDateInfo | null => {
    const dateFormatter = new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "numeric" });

    const formatDate = (date: MediaItem["startDate"]) => {
        if (!date || !date.year) return null;

        if (date.month && date.day) {
            const parsedDate = mediaDateToDate(date);
            if (!parsedDate) return null;

            try {
                return dateFormatter.format(parsedDate);
            } catch (error) {
                return parsedDate.toISOString().slice(0, 10);
            }
        }

        if (date.month) {
            const parsedDate = mediaDateToDate({ ...date, day: 1 });
            if (!parsedDate) return null;

            try {
                return new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short" }).format(parsedDate);
            } catch (error) {
                return `${date.year}-${String(date.month).padStart(2, "0")}`;
            }
        }

        return String(date.year);
    };

    const formattedStart = formatDate(anime.startDate);
    const formattedEnd = formatDate(anime.endDate);

    if (formattedStart && formattedEnd) {
        if (formattedStart === formattedEnd) return { label: { from: formattedStart, to: null }, isRange: false };
        return { label: { from: formattedStart, to: formattedEnd }, isRange: true };
    }

    if (formattedStart) return { label: { from: formattedStart, to: null }, isRange: false };
    if (formattedEnd) return { label: { from: null, to: formattedEnd }, isRange: false };

    return null;
};

export const getPrettyDuration = (duration: number) => {
    if (duration < 60) return `${duration} min${duration === 1 ? "" : "s"}`;
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return minutes > 0 ? `${hours} hour${hours === 1 ? "" : "s"} ${minutes} min${minutes === 1 ? "" : "s"}` : `${hours} hour${hours === 1 ? "" : "s"}`;
};

export const fetchMediaList = async ({ session, selectMedia }: { session: Session; selectMedia: number | number[] }) => {
    if (!session?.activeProvider) return;

    if (!Array.isArray(selectMedia)) selectMedia = [selectMedia];

    const { setFullMediaList, addSelectedMedia } = useAnimeStore.getState();

    try {
        const response = await fetch("/api/mediaList");
        if (response.ok) {
            const data = await response.json();
            setFullMediaList(data);
            addSelectedMedia(selectMedia);
        }
    } catch (error) {
        toast.error("Failed to fetch media list", { description: error instanceof Error ? error.message : "Unknown error" });
        console.error("Failed to fetch media list", error);
    }
};
