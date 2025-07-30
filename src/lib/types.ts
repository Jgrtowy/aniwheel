export interface PlannedItem {
    id: number;
    title: string;
    image?: {
        extraLarge?: string;
        large?: string;
        medium?: string;
    } | null;
    imageMal?: {
        medium?: string;
        large?: string;
    } | null;
    romajiTitle?: string;
    nativeTitle?: string;
    startDate?: { day: number; month: number; year: number };
    nextAiringEpisode?: { airingAt: number; timeUntilAiring: number };
    averageScore?: number;
    episodes?: number;
    siteUrl?: string;
    genres?: string[];
}

export interface Recommendations {
    id: number;
    media: PlannedItem;
    mediaRecommendation: PlannedItem;
    rating: number;
}

export type TitleLanguage = "english" | "romaji" | "native";
