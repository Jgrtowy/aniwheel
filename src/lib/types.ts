export interface MediaDate {
    day: number | null;
    month: number | null;
    year: number | null;
}

export interface MediaItem {
    id: number;
    title: {
        en: string | null;
        romaji: string;
        jp: string | null;
    };
    image: {
        extraLarge: string | null;
        large: string | null;
        medium: string;
    };
    startDate: MediaDate | null;
    endDate: MediaDate | null;
    averageScore: number | null;
    episodes: number;
    siteUrl: string;
    genres: string[];
    entryCreatedAt: number | null;
    status: "PLANNING" | "DROPPED" | "PAUSED" | null;
    format: "TV" | "TV_SHORT" | "MOVIE" | "SPECIAL" | "OVA" | "ONA" | "MUSIC" | "UNKNOWN";
    duration: number;
    studios: { name: string; isMain: boolean }[];
    releasingStatus: "FINISHED" | "RELEASING" | "NOT_YET_RELEASED" | "CANCELLED" | "HIATUS" | null;
    trailer: {
        id: string;
        site: "youtube" | "dailymotion";
    } | null;
    description: string | null;
    customLists: string[] | null;
    startSeason: {
        year: number | null;
        season: "WINTER" | "SPRING" | "SUMMER" | "FALL" | null;
    };
    externalLinks: { site: string; type: "INFO" | "STREAMING" | "SOCIAL"; url: string; language: string | null; notes: string | null; icon: string | null; color: string | null }[] | null;
    type: "ANIME" | "MANGA";
}

export interface MediaRecommendation {
    id: number;
    rating: number;
    media: MediaItem;
    mediaRecommendation: MediaItem;
}

export interface AniListMediaItem {
    id: number;
    title: {
        english: string | null;
        romaji: string;
        native: string;
    };
    coverImage: {
        medium: string;
        large: string;
        extraLarge: string;
    };
    startDate: {
        day: number | null;
        month: number | null;
        year: number | null;
    } | null;
    endDate: {
        day: number | null;
        month: number | null;
        year: number | null;
    } | null;
    averageScore: number | null;
    episodes: number | null;
    siteUrl: string;
    genres: string[];
    mediaListEntry: {
        createdAt: number;
        status: "PLANNING" | "DROPPED" | "PAUSED" | null;
        customLists?: { [key: string]: boolean } | null;
    } | null;
    format: "TV" | "TV_SHORT" | "MOVIE" | "SPECIAL" | "OVA" | "ONA" | "MUSIC";
    duration: number | null;
    status: "FINISHED" | "RELEASING" | "NOT_YET_RELEASED" | "CANCELLED" | "HIATUS" | null;
    studios: {
        edges: {
            isMain: boolean;
            node: {
                name: string;
            };
        }[];
    };
    trailer: {
        id: string;
        site: "youtube" | "dailymotion";
    } | null;
    description: string | null;
    season: "WINTER" | "SPRING" | "SUMMER" | "FALL" | null;
    seasonYear: number | null;
    externalLinks: { site: string; type: "INFO" | "STREAMING" | "SOCIAL"; url: string; language: string | null; notes: string | null; icon: string | null; color: string | null }[] | null;
    type: "ANIME" | "MANGA";
}

export interface AniListMediaRecommendation {
    id: number;
    rating: number;
    media: Omit<AniListMediaItem, "mediaListEntry">;
    mediaRecommendation: Omit<AniListMediaItem, "mediaListEntry">;
}

export interface MALMediaItem {
    id: number;
    title: string;
    alternative_titles: {
        en: string | null;
        ja: string | null;
    } | null;
    main_picture: {
        medium: string;
        large: string | null;
    } | null;
    start_date: string | null;
    end_date: string | null;
    mean: number | null;
    num_episodes: number;
    genres: { id: number; name: string }[];
    my_list_status: {
        updated_at: string;
        status: "watching" | "completed" | "on_hold" | "dropped" | "plan_to_watch";
        [key: string]: unknown;
    } | null;
    media_type: "unknown" | "tv" | "ova" | "movie" | "special" | "ona" | "music";
    average_episode_duration: number | null;
    status: "finished_airing" | "currently_airing" | "not_yet_aired" | "cancelled" | "on_hiatus" | null;
    studios: { id: number; name: string }[] | null;
    synopsis: string | null;
    start_season: {
        year: number;
        season: "winter" | "spring" | "summer" | "fall";
    } | null;
    external_links: null;
}

export type TitleLanguage = keyof MediaItem["title"];
export type ImageSize = keyof MediaItem["image"];

export type SortField = "date" | "title" | "score";
export type SortOrder = "asc" | "desc";

export interface UserProfile {
    id: string;
    name: string;
    image: string | null;
    url: string;
    accessToken: string;
    provider: "anilist" | "myanimelist";
}

export interface MalSessionPayload {
    user: {
        id: string;
        name: string;
        image: string | null;
        url: string;
        anilist: null;
        createdAt: number;
    };
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
    activeProvider: "myanimelist";
}
