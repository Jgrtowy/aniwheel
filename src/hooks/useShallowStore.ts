import { useAnimeStore } from "~/store/anime";
import { useSettingsStore } from "~/store/settings";

// Shallow selectors to prevent unnecessary re-renders
const selectedMediaSelector = (state: ReturnType<typeof useAnimeStore.getState>) => state.selectedMedia;
const toggleSelectedMediaSelector = (state: ReturnType<typeof useAnimeStore.getState>) => state.toggleSelectedMedia;
const viewModeSelector = (state: ReturnType<typeof useSettingsStore.getState>) => state.viewMode;
const preferredTitleLanguageSelector = (state: ReturnType<typeof useSettingsStore.getState>) => state.preferredTitleLanguage;
const preferredImageSizeSelector = (state: ReturnType<typeof useSettingsStore.getState>) => state.preferredImageSize;

export const useSelectedMedia = () => useAnimeStore(selectedMediaSelector);
export const useToggleSelectedMedia = () => useAnimeStore(toggleSelectedMediaSelector);
export const useViewMode = () => useSettingsStore(viewModeSelector);
export const usePreferredTitleLanguage = () => useSettingsStore(preferredTitleLanguageSelector);
export const usePreferredImageSize = () => useSettingsStore(preferredImageSizeSelector);
