import { useAnimeStore } from "~/store/anime";
import { useSettingsStore } from "~/store/settings";

// Shallow selectors to prevent unnecessary re-renders
const checkedMediaSelector = (state: ReturnType<typeof useAnimeStore.getState>) => state.checkedMedia;
const toggleSelectedMediaSelector = (state: ReturnType<typeof useAnimeStore.getState>) => state.toggleSelectedMedia;
const viewModeSelector = (state: ReturnType<typeof useSettingsStore.getState>) => state.viewMode;
const preferredTitleLanguageSelector = (state: ReturnType<typeof useSettingsStore.getState>) => state.preferredTitleLanguage;
const preferredImageSizeSelector = (state: ReturnType<typeof useSettingsStore.getState>) => state.preferredImageSize;

export const useCheckedMedia = () => useAnimeStore(checkedMediaSelector);
export const useToggleSelectedMedia = () => useAnimeStore(toggleSelectedMediaSelector);
export const useViewMode = () => useSettingsStore(viewModeSelector);
export const usePreferredTitleLanguage = () => useSettingsStore(preferredTitleLanguageSelector);
export const usePreferredImageSize = () => useSettingsStore(preferredImageSizeSelector);
