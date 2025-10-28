import { create } from "zustand";
import type { MediaItem, SortField, SortOrder } from "~/lib/types";
import { getTitleWithPreference, mediaDateToTimestamp } from "~/lib/utils";
import { useSettingsStore } from "~/store/settings";

export interface AnimeStore {
    fullMediaList: MediaItem[];
    mediaList: MediaItem[];
    selectedMedia: Set<number>;
    searchTerm: string;
    activeGenres: string[];
    score: { from: number; to: number };
    showPlanning: boolean;
    showPaused: boolean;
    showDropped: boolean;
    showUnaired: boolean;
    activeFormats: Set<MediaItem["format"]>;
    availableFormats: Set<MediaItem["format"]>;
    sortField: SortField;
    sortOrder: SortOrder;
    activeCustomLists: Set<string>;
    availableCustomLists: Set<string>;
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
    setActiveFormats: (formats: MediaItem["format"][]) => void;
    addActiveFormat: (format: MediaItem["format"]) => void;
    removeActiveFormat: (format: MediaItem["format"]) => void;
    setAvailableFormats: (formats: MediaItem["format"][]) => void;
    setActiveCustomLists: (lists: string[]) => void;
    addActiveCustomList: (list: string) => void;
    removeActiveCustomList: (list: string) => void;
    setSortField: (field: SortField) => void;
    setSortOrder: (order: SortOrder) => void;
    setSorting: (field: SortField, order: SortOrder) => void;
    initialize: () => void;
    applyFilters: () => void;
    clearFilters: () => void;
    hasActiveFilters: () => boolean;
    getActiveFilterCount: () => number;
}

export const useAnimeStore = create<AnimeStore>((set, get) => ({
    fullMediaList: [],
    mediaList: [],
    selectedMedia: new Set(),
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
    activeCustomLists: new Set(),
    availableCustomLists: new Set(),

    setFullMediaList: (list) => {
        set({ fullMediaList: list });
        get().applyFilters();
        get().initialize();
    },
    setMediaList: (list) => set({ mediaList: list }),
    setSelectedMedia: (selected) => set({ selectedMedia: selected }),
    toggleSelectedMedia: (id) => {
        const currentSelected = get().selectedMedia;
        const newSelected = new Set(currentSelected);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        if (newSelected.size !== currentSelected.size || !currentSelected.has(id) === newSelected.has(id)) {
            set({ selectedMedia: newSelected });
        }
    },
    addSelectedMedia: (id) => {
        const currentSelected = get().selectedMedia;
        const newSelected = new Set(currentSelected);
        let hasChanges = false;

        if (Array.isArray(id)) {
            for (const itemId of id) {
                if (!newSelected.has(itemId)) {
                    newSelected.add(itemId);
                    hasChanges = true;
                }
            }
        } else if (!newSelected.has(id)) {
            newSelected.add(id);
            hasChanges = true;
        }

        if (hasChanges) {
            set({ selectedMedia: newSelected });
        }
    },
    selectAllMedia: () => {
        const filteredIds = get().mediaList.map((a) => a.id);
        const newSelected = new Set([...filteredIds]);
        set({ selectedMedia: newSelected });
    },
    deselectAllMedia: () => set({ selectedMedia: new Set() }),
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
    setActiveCustomLists: (lists) => {
        set({ activeCustomLists: new Set(lists) });
        get().applyFilters();
    },
    addActiveCustomList: (list) => {
        const current = get().activeCustomLists;
        if (!current.has(list)) {
            set({ activeCustomLists: new Set([...current, list]) });
            get().applyFilters();
        }
    },
    removeActiveCustomList: (list) => {
        const current = get().activeCustomLists;
        set({ activeCustomLists: new Set([...current].filter((f) => f !== list)) });
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
        const availableFormatsArr = Array.from(new Set(state.fullMediaList.map((anime) => anime.format).filter((format): format is MediaItem["format"] => format !== null))).sort((a, b) => FORMAT_ORDER.indexOf(a) - FORMAT_ORDER.indexOf(b));

        const availableCustomListsSet = new Set<string>();
        for (const anime of state.fullMediaList) {
            if (anime.customLists && anime.customLists.length > 0) {
                for (const list of anime.customLists) {
                    availableCustomListsSet.add(list);
                }
            }
        }
        const availableCustomListsArr = Array.from(availableCustomListsSet).sort((a, b) => a.localeCompare(b));

        set({ availableCustomLists: new Set(availableCustomListsArr) });
        set({
            availableFormats: new Set(availableFormatsArr),
            activeFormats: new Set(availableFormatsArr),
        });
    },
    applyFilters: () => {
        const state = get();
        let filteredAnime = state.fullMediaList;

        const settings = useSettingsStore.getState();
        const searchTermLower = state.searchTerm.toLowerCase();

        if (state.searchTerm) {
            filteredAnime = filteredAnime.filter((anime) => anime.title.en?.toLowerCase().includes(searchTermLower) || anime.title.romaji?.toLowerCase().includes(searchTermLower) || anime.title.jp?.toLowerCase().includes(searchTermLower));
        }

        if (state.activeGenres.length > 0) {
            filteredAnime = filteredAnime.filter((anime) => {
                if (!anime.genres || anime.genres.length === 0) return false;
                return state.activeGenres.every((selectedGenre) => anime.genres?.includes(selectedGenre) ?? false);
            });
        }

        if (!state.showUnaired) {
            const currentDate = Date.now();
            filteredAnime = filteredAnime.filter((anime) => {
                if (!anime.startDate) return false;
                const releaseTimestamp = mediaDateToTimestamp(anime.startDate);
                if (releaseTimestamp === null) return false;
                return releaseTimestamp <= currentDate;
            });
        }

        if (state.score.from > 0 || state.score.to < 10) {
            filteredAnime = filteredAnime.filter((anime) => {
                const score = anime.averageScore;
                if (score === null) return false;
                return score >= state.score.from && score <= state.score.to;
            });
        }

        if (!state.showDropped) filteredAnime = filteredAnime.filter((anime) => anime.status !== "DROPPED");
        if (!state.showPaused) filteredAnime = filteredAnime.filter((anime) => anime.status !== "PAUSED");
        if (!state.showPlanning) filteredAnime = filteredAnime.filter((anime) => anime.status !== "PLANNING");

        if (state.activeFormats.size > 0) {
            filteredAnime = filteredAnime.filter((anime) => {
                if (!anime.format) return false;
                return state.activeFormats.has(anime.format);
            });
        }
        if (state.activeCustomLists.size > 0) {
            filteredAnime = filteredAnime.filter((anime) => {
                if (!anime.customLists || anime.customLists.length === 0) return false;
                return Array.from(state.activeCustomLists).every((list) => anime.customLists?.includes(list));
            });
        }

        filteredAnime = filteredAnime.slice().sort((a, b) => {
            let comparison: number;

            switch (state.sortField) {
                case "date": {
                    comparison = (a.entryCreatedAt ?? 0) < (b.entryCreatedAt ?? 0) ? -1 : (a.entryCreatedAt ?? 0) > (b.entryCreatedAt ?? 0) ? 1 : 1;
                    break;
                }
                case "title": {
                    comparison = getTitleWithPreference(a, settings.preferredTitleLanguage).localeCompare(getTitleWithPreference(b, settings.preferredTitleLanguage));
                    break;
                }
                case "score": {
                    comparison = (a.averageScore || 0) < (b.averageScore || 0) ? -1 : (a.averageScore || 0) > (b.averageScore || 0) ? 1 : 0;
                    break;
                }
                default: {
                    comparison = 0;
                }
            }

            return state.sortOrder === "asc" ? comparison : -comparison;
        });

        set({ mediaList: filteredAnime });
    },
    clearFilters: () => {
        const available = get().availableFormats;
        set({
            activeGenres: [],
            score: { from: 0, to: 10 },
            showUnaired: false,
            showPlanning: true,
            showDropped: false,
            showPaused: false,
            activeFormats: available,
            activeCustomLists: new Set(),
        });
        get().applyFilters();
    },
    hasActiveFilters: () => {
        const state = get();
        return state.activeGenres.length > 0 || state.showUnaired || state.score.from > 0 || state.score.to < 10 || !state.showPlanning || state.showDropped || state.showPaused || state.activeFormats.size < state.availableFormats.size || state.activeCustomLists.size > 0;
    },
    getActiveFilterCount: () => {
        const state = get();
        return (
            (state.activeGenres.length > 0 ? 1 : 0) +
            (state.showUnaired ? 1 : 0) +
            (state.score.from > 0 || state.score.to < 10 ? 1 : 0) +
            (state.showPlanning ? 0 : 1) +
            (state.showDropped ? 1 : 0) +
            (state.showPaused ? 1 : 0) +
            (state.activeFormats.size < state.availableFormats.size ? 1 : 0) +
            (state.activeCustomLists.size > 0 ? 1 : 0)
        );
    },
}));
