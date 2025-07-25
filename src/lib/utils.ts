import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { PlannedItem, TitleLanguage } from "~/lib/types";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const getTitleWithPreference = (itemObject: PlannedItem, language: TitleLanguage): string => (language === "english" ? itemObject.title || "[Unknown Title]" : language === "romaji" ? itemObject.romajiTitle || "[Unknown Title]" : itemObject.nativeTitle || "[Unknown Title]");
