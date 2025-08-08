"use client";

import { Search, X } from "lucide-react";
import Aurora from "~/components/Aurora";
import FiltersDropdown from "~/components/FiltersDropdown";
import Header from "~/components/Header";
import MediaList from "~/components/MediaList";
import SidePanel from "~/components/SidePanel";
import SortingDropdown from "~/components/SortingDropdown";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import useMediaQuery from "~/hooks/useMediaQuery";
import { useAnimeStore } from "~/lib/store";

export default function Home() {
    const { searchTerm, setSearchTerm } = useAnimeStore();

    const isDesktop = useMediaQuery("(width >= 40rem)");
    return (
        <>
            <div className="fixed top-0 w-[200%] sm:h-full sm:w-full -z-10 pointer-events-none">
                <Aurora colorStops={isDesktop ? ["#1100c8", "#b33796", "#a410ff"] : ["#1100c8", "#b33796"]} blend={0.75} amplitude={0.75} speed={0.5} />
            </div>
            <Header />
            <div className="p-2 sm:p-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col-reverse md:flex-row gap-4">
                        <div className="flex-1 flex-col rounded-xl border p-4 sm:p-6 space-y-6 bg-component-primary">
                            <div className="flex justify-between">
                                <div className="relative shrink-0">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
                                    <Input type="text" placeholder="Search..." className="w-34 sm:w-48 md:w-64 transition-all pl-8 text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                                    {searchTerm && (
                                        <Button variant="ghost" size="sm" onClick={() => setSearchTerm("")} className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted">
                                            <X className="h-3 w-3" />
                                            <span className="sr-only">Clear search</span>
                                        </Button>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <FiltersDropdown />
                                    <SortingDropdown />
                                </div>
                            </div>
                            <MediaList />
                        </div>

                        <div className="lg:w-80 flex flex-col gap-4">
                            <SidePanel />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
