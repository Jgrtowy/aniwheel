import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ImageSize, TitleLanguage } from "~/lib/types";

export interface SettingsStore {
    preferredTitleLanguage: TitleLanguage;
    preferredImageSize: ImageSize;
    showMediaRecommendations: boolean;
    skipLandingAnimation: boolean;
    enableTickSounds: boolean;
    viewMode: "grid" | "list";
    setPreferredTitleLanguage: (lang: TitleLanguage) => void;
    setPreferredImageSize: (size: ImageSize) => void;
    setShowMediaRecommendations: (show: boolean) => void;
    setSkipLandingAnimation: (skip: boolean) => void;
    setEnableTickSounds: (enable: boolean) => void;
    setViewMode: (mode: "grid" | "list") => void;
}

export const useSettingsStore = create<SettingsStore>()(
    persist(
        (set) => ({
            preferredTitleLanguage: "en",
            preferredImageSize: "large",
            showMediaRecommendations: true,
            skipLandingAnimation: false,
            enableTickSounds: true,
            viewMode: "grid",
            setPreferredTitleLanguage: (lang) => set({ preferredTitleLanguage: lang }),
            setPreferredImageSize: (size) => set({ preferredImageSize: size }),
            setShowMediaRecommendations: (show) => set({ showMediaRecommendations: show }),
            setSkipLandingAnimation: (skip) => set({ skipLandingAnimation: skip }),
            setEnableTickSounds: (enable) => set({ enableTickSounds: enable }),
            setViewMode: (mode) => set({ viewMode: mode }),
        }),
        { name: "aniwheel-settings" },
    ),
);
