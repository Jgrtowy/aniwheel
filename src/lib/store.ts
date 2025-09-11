import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Format, ImageSize, MediaItem, SortField, SortOrder, TitleLanguage } from "~/lib/types";
import { getTitleWithPreference } from "~/lib/utils";

interface AnimeStore {
    // Full, unfiltered list of titles
    fullMediaList: MediaItem[];

    // Currently displayed titles list, can be filtered
    mediaList: MediaItem[];

    // Set of title IDs that are checked (e.g., for bulk actions)
    checkedMedia: Set<number>;

    // Filters
    searchTerm: string;
    activeGenres: string[];
    score: { from: number; to: number };
    showPlanning: boolean;
    showPaused: boolean;
    showDropped: boolean;
    showUnaired: boolean;
    activeFormats: Set<Format>;
    availableFormats: Set<Format>;

    // Sorting
    sortField: SortField;
    sortOrder: SortOrder;

    setFullMediaList: (list: MediaItem[]) => void;

    setMediaList: (list: MediaItem[]) => void;

    setSelectedMedia: (set: Set<number>) => void;
    addSelectedMedia: (id: number | number[]) => void;
    toggleSelectedMedia: (id: number) => void;
    selectAllMedia: () => void;
    deselectAllMedia: () => void;

    setSearchTerm: (term: string) => void;

    setActiveGenres: (genres: string[]) => void;
    addActiveGenre: (genre: string) => void;
    removeActiveGenre: (genre: string) => void;

    setScore: (from: number | null, to: number | null) => void;

    setShowPlanning: (show: boolean) => void;
    setShowPaused: (show: boolean) => void;
    setShowDropped: (show: boolean) => void;

    setShowUnaired: (show: boolean) => void;

    setActiveFormats: (formats: Format[]) => void;
    addActiveFormat: (format: Format) => void;
    removeActiveFormat: (format: Format) => void;

    setAvailableFormats: (formats: Format[]) => void;

    setSortField: (field: SortField) => void;
    setSortOrder: (order: SortOrder) => void;
    setSorting: (field: SortField, order: SortOrder) => void;

    initialize: () => void;
    applyFilters: () => void;
    clearFilters: () => void;
    hasActiveFilters: () => boolean;
    getActiveFilterCount: () => number;
}

interface SettingsStore {
    preferredTitleLanguage: TitleLanguage;
    preferredImageSize: ImageSize;
    showMediaRecommendations: boolean;
    skipLandingAnimation: boolean;
    enableTickSounds: boolean;
    viewMode: "grid" | "list" | "compact";
    analyticsEnabled: boolean;

    setPreferredTitleLanguage: (lang: TitleLanguage) => void;
    setPreferredImageSize: (size: ImageSize) => void;
    setShowMediaRecommendations: (show: boolean) => void;
    setSkipLandingAnimation: (skip: boolean) => void;
    setEnableTickSounds: (enable: boolean) => void;
    setViewMode: (mode: "grid" | "list" | "compact") => void;
    setAnalyticsEnabled: (enabled: boolean) => void;
}

export const useAnimeStore = create<AnimeStore>((set, get) => ({
    fullMediaList: [],
    mediaList: [],
    checkedMedia: new Set(),
    searchTerm: "",
    activeGenres: [],
    score: { from: 0, to: 10 },
    showUnaired: false,
    sortField: "date",
    sortOrder: "desc",
    showPlanning: true,
    showPaused: false,
    showDropped: false,
    activeFormats: new Set(),
    availableFormats: new Set(),

    setFullMediaList: (list) => {
        set({ fullMediaList: list });
        get().applyFilters();
        get().initialize();
    },
    setMediaList: (list) => set({ mediaList: list }),
    setSelectedMedia: (checked) => set({ checkedMedia: checked }),
    toggleSelectedMedia: (id) => {
        const checked = new Set(get().checkedMedia);
        if (checked.has(id)) checked.delete(id);
        else checked.add(id);
        set({ checkedMedia: checked });
    },
    addSelectedMedia: (id) => {
        const checked = new Set(get().checkedMedia);
        if (Array.isArray(id)) for (const itemId of id) checked.add(itemId);
        else checked.add(id);
        set({ checkedMedia: checked });
    },
    selectAllMedia: () => set({ checkedMedia: new Set(get().mediaList.map((a) => a.id)) }),
    deselectAllMedia: () => set({ checkedMedia: new Set() }),
    setSearchTerm: (term) => {
        set({ searchTerm: term });
        get().applyFilters();
    },
    setActiveGenres: (genres) => {
        set({ activeGenres: genres });
        get().applyFilters();
    },
    addActiveGenre: (genre) => {
        const current = get().activeGenres;
        if (!current.includes(genre)) {
            set({ activeGenres: [...current, genre] });
            get().applyFilters();
        }
    },
    removeActiveGenre: (genre) => {
        const current = get().activeGenres;
        set({ activeGenres: current.filter((g) => g !== genre) });
        get().applyFilters();
    },
    setActiveFormats: (formats) => {
        set({ activeFormats: new Set(formats) });
        get().applyFilters();
    },
    addActiveFormat: (format) => {
        const current = get().activeFormats;
        if (!current.has(format)) {
            set({ activeFormats: new Set([...current, format]) });
            get().applyFilters();
        }
    },
    removeActiveFormat: (format) => {
        const current = get().activeFormats;
        set({ activeFormats: new Set([...current].filter((f) => f !== format)) });
        get().applyFilters();
    },
    setAvailableFormats: (formats) => {
        set({ availableFormats: new Set(formats) });
        get().applyFilters();
    },
    setScore: (from, to) => {
        set({ score: { from: from ?? get().score.from, to: to ?? get().score.to } });
        get().applyFilters();
    },
    setShowPlanning: (show) => {
        set({ showPlanning: show });
        get().applyFilters();
    },
    setShowPaused: (show) => {
        set({ showPaused: show });
        get().applyFilters();
    },
    setShowDropped: (show) => {
        set({ showDropped: show });
        get().applyFilters();
    },
    setShowUnaired: (show) => {
        set({ showUnaired: show });
        get().applyFilters();
    },
    setSortField: (field) => {
        set({ sortField: field });
        get().applyFilters();
    },
    setSortOrder: (order) => {
        set({ sortOrder: order });
        get().applyFilters();
    },
    setSorting: (field, order) => {
        set({ sortField: field, sortOrder: order });
        get().applyFilters();
    },

    initialize: () => {
        const state = get();
        const FORMAT_ORDER = ["TV", "TV_SHORT", "ONA", "OVA", "MOVIE", "SPECIAL", "UNKNOWN"];
        const availableFormatsArr = Array.from(new Set(state.fullMediaList.map((anime) => anime.format).filter((format): format is Format => format !== null))).sort((a, b) => FORMAT_ORDER.indexOf(a) - FORMAT_ORDER.indexOf(b));
        set({
            availableFormats: new Set(availableFormatsArr),
            activeFormats: new Set(availableFormatsArr),
        });
    },
    applyFilters: () => {
        const state = get();
        let filteredAnime = state.fullMediaList;

        // Search term filter
        if (state.searchTerm) filteredAnime = filteredAnime.filter((anime) => anime.title.en?.toLowerCase().includes(state.searchTerm.toLowerCase()) || anime.title.romaji?.toLowerCase().includes(state.searchTerm.toLowerCase()) || anime.title.jp?.toLowerCase().includes(state.searchTerm.toLowerCase()));

        // Genre filter
        if (state.activeGenres.length > 0) {
            filteredAnime = filteredAnime.filter((anime) => {
                if (!anime.genres || anime.genres.length === 0) return false;
                return state.activeGenres.every((selectedGenre) => anime.genres?.includes(selectedGenre) ?? false);
            });
        }

        // Show unaired filter
        if (!state.showUnaired) {
            const currentDate = Date.now();
            filteredAnime = filteredAnime.filter((anime) => {
                if (!anime.startDate) return false;
                return new Date(anime.startDate).getTime() <= currentDate;
            });
        }

        // Score range filter
        if (state.score.from > 0 || state.score.to < 10) {
            filteredAnime = filteredAnime.filter((anime) => {
                const score = anime.averageScore;
                if (score === null) return false;
                return score >= state.score.from && score <= state.score.to;
            });
        }

        // Status filter
        if (!state.showDropped) filteredAnime = filteredAnime.filter((anime) => anime.status !== "DROPPED");
        if (!state.showPaused) filteredAnime = filteredAnime.filter((anime) => anime.status !== "PAUSED");
        if (!state.showPlanning) filteredAnime = filteredAnime.filter((anime) => anime.status !== "PLANNING");

        // Format filter
        if (state.activeFormats.size > 0) {
            filteredAnime = filteredAnime.filter((anime) => {
                if (!anime.format) return false;
                return state.activeFormats.has(anime.format);
            });
        }

        // Apply sorting
        filteredAnime = filteredAnime.slice().sort((a, b) => {
            let comparison: number;

            switch (state.sortField) {
                case "date": {
                    comparison = (a.entryCreatedAt ?? 0) < (b.entryCreatedAt ?? 0) ? -1 : (a.entryCreatedAt ?? 0) > (b.entryCreatedAt ?? 0) ? 1 : 1; // I will personally fight a duck-sized horse on live television if you're able to tell me why I put a "1" here despite it should be "0" for the sorting to be correct
                    break;
                }
                case "title": {
                    comparison = getTitleWithPreference(a).localeCompare(getTitleWithPreference(b));
                    break;
                }
                case "score": {
                    comparison = (a.averageScore || 0) < (b.averageScore || 0) ? -1 : (a.averageScore || 0) > (b.averageScore || 0) ? 1 : 0; // Note: Inverted sort order for better UX (asc is high to low and desc is low to high)
                    break;
                }
            }

            return state.sortOrder === "asc" ? comparison : -comparison;
        });

        set({ mediaList: filteredAnime });

        // Update checked media to only include items that are still in the filtered list
        if (state.checkedMedia.size > 0) {
            const filteredAnimeIds = new Set(filteredAnime.map((anime) => anime.id));
            const updatedCheckedAnime = new Set<number>();

            for (const animeId of state.checkedMedia) {
                if (filteredAnimeIds.has(animeId)) updatedCheckedAnime.add(animeId);
            }

            if (updatedCheckedAnime.size !== state.checkedMedia.size) {
                set({ checkedMedia: updatedCheckedAnime });
            }
        }
    },
    clearFilters: () => {
        const available = get().availableFormats;
        set({ activeGenres: [], score: { from: 0, to: 10 }, showUnaired: false, showPlanning: true, showDropped: false, showPaused: false, activeFormats: available });
        get().applyFilters();
    },

    hasActiveFilters: () => {
        const state = get();
        return state.activeGenres.length > 0 || state.showUnaired || state.score.from > 0 || state.score.to < 10 || !state.showPlanning || state.showDropped || state.showPaused || state.activeFormats.size < state.availableFormats.size;
    },
    getActiveFilterCount: () => {
        const state = get();
        return (state.activeGenres.length > 0 ? 1 : 0) + (state.showUnaired ? 1 : 0) + (state.score.from > 0 || state.score.to < 10 ? 1 : 0) + (state.showPlanning ? 0 : 1) + (state.showDropped ? 1 : 0) + (state.showPaused ? 1 : 0) + (state.activeFormats.size < state.availableFormats.size ? 1 : 0);
    },
}));

export const useSettingsStore = create<SettingsStore>()(
    persist(
        (set) => ({
            preferredTitleLanguage: "en",
            preferredImageSize: "large",
            showMediaRecommendations: true,
            skipLandingAnimation: false,
            enableTickSounds: true,
            viewMode: "grid",
            analyticsEnabled: true,

            setPreferredTitleLanguage: (lang) => set({ preferredTitleLanguage: lang }),
            setPreferredImageSize: (size) => set({ preferredImageSize: size }),
            setShowMediaRecommendations: (show) => set({ showMediaRecommendations: show }),
            setSkipLandingAnimation: (skip) => set({ skipLandingAnimation: skip }),
            setEnableTickSounds: (enable) => set({ enableTickSounds: enable }),
            setViewMode: (mode) => set({ viewMode: mode }),
            setAnalyticsEnabled: (enabled) => set({ analyticsEnabled: enabled }),
        }),
        { name: "aniwheel-settings" },
    ),
);
