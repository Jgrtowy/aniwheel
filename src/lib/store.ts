import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PlannedItem, Recommendations, TitleLanguage } from "~/lib/types";

interface AnimeStore {
    animeList: PlannedItem[];
    fullAnimeList: PlannedItem[];
    checkedAnime: Set<number>;
    scoreThreshold: number;
    customTitle: string;
    recommendations: Recommendations[];
    fetchingCustom: boolean;
    showAiredOnly: boolean;
    selectedGenres: string[];

    setAnimeList: (list: PlannedItem[]) => void;
    setFullAnimeList: (list: PlannedItem[]) => void;
    setCheckedAnime: (set: Set<number>) => void;
    toggleCheckedAnime: (id: number) => void;
    selectAll: () => void;
    deselectAll: () => void;
    setScoreThreshold: (score: number) => void;
    setCustomTitle: (title: string) => void;
    setRecommendations: (recs: Recommendations[]) => void;
    setFetchingCustom: (fetching: boolean) => void;
    setShowAiredOnly: (show: boolean) => void;
    setSelectedGenres: (genres: string[]) => void;
    addGenre: (genre: string) => void;
    removeGenre: (genre: string) => void;
}

interface SettingsStore {
    titleLanguage: TitleLanguage;
    imageSize: "medium" | "large" | "extraLarge";
    showRecommendations: boolean;
    backdropEffects: boolean;
    skipLandingAnimation: boolean;
    enableTickSounds: boolean;

    setTitleLanguage: (lang: TitleLanguage) => void;
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
    scoreThreshold: 0,
    customTitle: "",
    recommendations: [],
    fetchingCustom: false,
    showAiredOnly: false,
    selectedGenres: [],

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
    setScoreThreshold: (score) => set({ scoreThreshold: score }),
    setCustomTitle: (title) => set({ customTitle: title }),
    setRecommendations: (recs) => set({ recommendations: recs }),
    setFetchingCustom: (fetching) => set({ fetchingCustom: fetching }),
    setShowAiredOnly: (show) => set({ showAiredOnly: show }),
    setSelectedGenres: (genres) => set({ selectedGenres: genres }),
    addGenre: (genre) => {
        const current = get().selectedGenres;
        if (!current.includes(genre)) set({ selectedGenres: [...current, genre] });
    },
    removeGenre: (genre) => {
        const current = get().selectedGenres;
        set({ selectedGenres: current.filter((g) => g !== genre) });
    },
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
