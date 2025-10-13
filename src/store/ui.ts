import { create } from "zustand";

interface UiStore {
    addToPlannedSheet: {
        open: boolean;
        setOpen: (open: boolean) => void;
    };
}

export const useUiStore = create<UiStore>((set) => ({
    addToPlannedSheet: {
        open: false,
        setOpen: (open) =>
            set((state) => ({
                addToPlannedSheet: {
                    ...state.addToPlannedSheet,
                    open,
                },
            })),
    },
}));
