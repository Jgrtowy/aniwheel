"use client";

import { formatForDisplay, useHotkey } from "@tanstack/react-hotkeys";
import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { Kbd } from "~/components/ui/kbd";
import { useDebounce } from "~/hooks/useDebounce";
import { useAnimeStore } from "~/store/anime";
import { InputGroup, InputGroupAddon, InputGroupInput } from "./ui/input-group";

export default function SearchInput() {
    const { searchTerm, setSearchTerm } = useAnimeStore();
    const [value, setValue] = useState(searchTerm);
    const [isFocused, setIsFocused] = useState(false);
    const debouncedValue = useDebounce(value, 300);
    const inputRef = useRef<HTMLInputElement>(null);
    const shortcut = formatForDisplay("Mod+");
    const hasPlus = shortcut.endsWith("+");

    // Sync store change to local
    useEffect(() => {
        if (searchTerm !== debouncedValue) setValue(searchTerm);
    }, [searchTerm]);

    // Sync local debounced change to store
    useEffect(() => {
        if (debouncedValue !== searchTerm) setSearchTerm(debouncedValue);
    }, [debouncedValue, setSearchTerm, searchTerm]);

    useHotkey("Mod+/", () => {
        inputRef.current?.focus();
    });

    useHotkey("Escape", () => {
        if (document.activeElement === inputRef.current) inputRef.current?.blur();
    });

    const handleClear = () => {
        setValue("");
        setSearchTerm("");
        inputRef.current?.focus();
    };

    return (
        <div className="relative w-full sm:max-w-64 max-w-full">
            <InputGroup>
                <InputGroupInput placeholder="Search..." value={value} onChange={(e) => setValue(e.target.value)} ref={inputRef} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} />
                <InputGroupAddon>
                    <Search />
                </InputGroupAddon>
                {!isFocused && !value && (
                    <InputGroupAddon align="inline-end">
                        <Kbd>{hasPlus ? shortcut.slice(0, -1) : shortcut}</Kbd>
                        {hasPlus ? " + " : ""}
                        <Kbd>/</Kbd>
                    </InputGroupAddon>
                )}
                {!!value && (
                    <InputGroupAddon align="inline-end">
                        <Button variant="ghost" size="icon" className="size-6" onClick={handleClear}>
                            <X className="size-4" />
                        </Button>
                    </InputGroupAddon>
                )}
            </InputGroup>
        </div>
    );
}
