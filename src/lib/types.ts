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
    startDate: Date | null;
    averageScore: number | null;
    episodes: number;
    siteUrl: string;
    genres: string[];
    entryCreatedAt: number | null;
    isCustom: boolean;
    status: string;
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
    averageScore: number | null;
    episodes: number | null;
    siteUrl: string;
    genres: string[];
    mediaListEntry: {
        createdAt: number;
    } | null;
    status?: string;
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
    mean: number | null;
    num_episodes: number;
    genres: { id: number; name: string }[];
    my_list_status: {
        updated_at: string;
        status: string;
        [key: string]: unknown;
    } | null;
}

export type TitleLanguage = keyof MediaItem["title"];
export type ImageSize = keyof MediaItem["image"];

export type SortField = "date" | "title" | "score";
export type SortOrder = "asc" | "desc";

export interface UserProfile {
    id: string;
    name: string;
    image?: string;
    accessToken: string;
    provider: "anilist" | "myanimelist";
}
