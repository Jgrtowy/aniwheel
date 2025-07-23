import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PlannedItem, Recommendations } from "~/lib/types";

interface AnimeStore {
    animeList: PlannedItem[];
    fullAnimeList: PlannedItem[];
    checkedAnime: Set<number>;
    titleLanguage: "english" | "romaji" | "native";
    scoreThreshold: number;
    customTitle: string;
    showWheel: boolean;
    recommendations: Recommendations[];
    fetchingCustom: boolean;

    setAnimeList: (list: PlannedItem[]) => void;
    setFullAnimeList: (list: PlannedItem[]) => void;
    setCheckedAnime: (set: Set<number>) => void;
    toggleCheckedAnime: (id: number) => void;
    selectAll: () => void;
    deselectAll: () => void;
    setTitleLanguage: (lang: "english" | "romaji" | "native") => void;
    setScoreThreshold: (score: number) => void;
    setCustomTitle: (title: string) => void;
    setShowWheel: (show: boolean) => void;
    setRecommendations: (recs: Recommendations[]) => void;
    setFetchingCustom: (fetching: boolean) => void;
}

interface SettingsStore {
    titleLanguage: "english" | "romaji" | "native";
    imageSize: "medium" | "large" | "extraLarge";
    showRecommendations: boolean;
    backdropEffects: boolean;
    skipLandingAnimation: boolean;
    enableTickSounds: boolean;

    setTitleLanguage: (lang: "english" | "romaji" | "native") => void;
    setImageSize: (size: "medium" | "large" | "extraLarge") => void;
    setShowRecommendations: (show: boolean) => void;
    setBackdropEffects: (blur: boolean) => void;
    setSkipLandingAnimation: (skip: boolean) => void;
    setEnableTickSounds: (enable: boolean) => void;
}

export const useAnimeStore = create<AnimeStore>((set, get) => ({
    animeList: [],
    fullAnimeList: [],
    checkedAnime: new Set(),
    titleLanguage: "english",
    scoreThreshold: 0,
    customTitle: "",
    showWheel: false,
    recommendations: [],
    fetchingCustom: false,

    setAnimeList: (list) => set({ animeList: list }),
    setFullAnimeList: (list) => set({ fullAnimeList: list }),
    setCheckedAnime: (checked) => set({ checkedAnime: checked }),
    toggleCheckedAnime: (id) => {
        const checked = new Set(get().checkedAnime);
        if (checked.has(id)) checked.delete(id);
        else checked.add(id);
        set({ checkedAnime: checked });
    },
    selectAll: () => set({ checkedAnime: new Set(get().animeList.map((a) => a.id)) }),
    deselectAll: () => set({ checkedAnime: new Set() }),
    setTitleLanguage: (lang) => set({ titleLanguage: lang }),
    setScoreThreshold: (score) => set({ scoreThreshold: score }),
    setCustomTitle: (title) => set({ customTitle: title }),
    setShowWheel: (show) => set({ showWheel: show }),
    setRecommendations: (recs) => set({ recommendations: recs }),
    setFetchingCustom: (fetching) => set({ fetchingCustom: fetching }),
}));

export const useSettingsStore = create<SettingsStore>()(
    persist(
        (set) => ({
            titleLanguage: "english",
            imageSize: "large",
            showRecommendations: true,
            backdropEffects: false,
            skipLandingAnimation: false,
            enableTickSounds: true,

            setTitleLanguage: (lang) => set({ titleLanguage: lang }),
            setImageSize: (size) => set({ imageSize: size }),
            setShowRecommendations: (show) => set({ showRecommendations: show }),
            setBackdropEffects: (backdropEffects) => set({ backdropEffects: backdropEffects }),
            setSkipLandingAnimation: (skip) => set({ skipLandingAnimation: skip }),
            setEnableTickSounds: (enable) => set({ enableTickSounds: enable }),
        }),
        {
            name: "aniwheel-settings",
        },
    ),
);
