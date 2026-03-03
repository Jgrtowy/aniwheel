import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { ImageSize, TitleLanguage } from "~/lib/types";
import { useAnimeStore } from "./anime";

export interface SettingsStore {
    preferredTitleLanguage: TitleLanguage;
    preferredImageSize: ImageSize;
    hideRecommendationsDeck: boolean;
    skipLandingAnimation: boolean;
    enableTickSounds: boolean;
    viewMode: "grid" | "list";
    hasSeenMai: boolean;
    skippedMediaIds: number[];
    sortField: "date" | "title" | "score";
    sortOrder: "asc" | "desc";
    setPreferredTitleLanguage: (lang: TitleLanguage) => void;
    setPreferredImageSize: (size: ImageSize) => void;
    setHideRecommendationsDeck: (hide: boolean) => void;
    setSkipLandingAnimation: (skip: boolean) => void;
    setEnableTickSounds: (enable: boolean) => void;
    setViewMode: (mode: "grid" | "list") => void;
    setHasSeenMai: (seen: boolean) => void;
    addSkippedMediaId: (id: number) => void;
    removeSkippedMediaId: (id: number) => void;
    resetSkippedMediaIds: () => void;
    setSortField: (field: "date" | "title" | "score") => void;
    setSortOrder: (order: "asc" | "desc") => void;
}

export const useSettingsStore = create<SettingsStore>()(
    persist(
        (set) => ({
            preferredTitleLanguage: "en",
            preferredImageSize: "large",
            hideRecommendationsDeck: false,
            skipLandingAnimation: false,
            enableTickSounds: true,
            viewMode: "grid",
            hasSeenMai: false,
            skippedMediaIds: [],
            sortField: "date",
            sortOrder: "desc",
            setPreferredTitleLanguage: (lang) => set({ preferredTitleLanguage: lang }),
            setPreferredImageSize: (size) => set({ preferredImageSize: size }),
            setHideRecommendationsDeck: (hide) => set({ hideRecommendationsDeck: hide }),
            setSkipLandingAnimation: (skip) => set({ skipLandingAnimation: skip }),
            setEnableTickSounds: (enable) => set({ enableTickSounds: enable }),
            setViewMode: (mode) => set({ viewMode: mode }),
            setHasSeenMai: (seen) => set({ hasSeenMai: seen }),
            addSkippedMediaId: (id) => set((state) => (state.skippedMediaIds.includes(id) ? state : { skippedMediaIds: [...state.skippedMediaIds, id] })),
            removeSkippedMediaId: (id) => set((state) => ({ skippedMediaIds: state.skippedMediaIds.filter((skippedId) => skippedId !== id) })),
            resetSkippedMediaIds: () => set({ skippedMediaIds: [] }),
            setSortField: (field) => {
                set({ sortField: field });
                useAnimeStore.getState().applyFilters();
            },
            setSortOrder: (order) => {
                set({ sortOrder: order });
                useAnimeStore.getState().applyFilters();
            },
        }),
        { name: "aniwheel-settings" },
    ),
);
