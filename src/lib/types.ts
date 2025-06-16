export interface PlannedItem {
    id: number;
    title: string;
    image?: string;
    romajiTitle?: string;
    nativeTitle?: string;
    startDate?: { day: number; month: number; year: number };
    nextAiringEpisode?: { airingAt: number; timeUntilAiring: number };
}
