"use client";

import { MotionConfig, motion } from "motion/react";
import { memo, useEffect, useState } from "react";
import Aurora from "~/components/Aurora";
import BackToTop from "~/components/BackToTop";
import FiltersDropdown from "~/components/FiltersDropdown";
import Header from "~/components/Header";
import MaiEasterEgg from "~/components/MaiEasterEgg";
import MediaList from "~/components/MediaList";
import SearchInput from "~/components/SearchInput";
import SidePanel from "~/components/SidePanel";
import SortingDropdown from "~/components/SortingDropdown";
import ViewToggle from "~/components/ViewToggle";

const MemoizedAurora = memo(Aurora);

export default function Home() {
    const [colorStops, setColorStops] = useState<string[]>(["#2e1cff", "#ff3161", "#b032ff"]);

    useEffect(() => {
        setColorStops((prev) => [...prev].sort(() => Math.random() - 0.5));
    }, []);

    return (
        <MotionConfig reducedMotion="user">
            <div className="relative">
                <motion.div className="fixed w-full h-3/4 sm:h-full -z-10 pointer-events-none brightness-[140%]" initial={{ opacity: 0, y: -250 }} animate={{ opacity: 0.8, y: 0, transition: { duration: 2 } }}>
                    <MemoizedAurora colorStops={colorStops} blend={1} amplitude={0.75} speed={0.5} />
                </motion.div>
                <div className="max-w-[82rem] mx-auto p-4 space-y-4">
                    <Header />
                    <main className="flex flex-col-reverse md:flex-row gap-4">
                        <section className="flex-1 flex-col rounded-xl border p-4 sm:p-6 space-y-6 bg-component-primary">
                            <div className="flex sm:justify-between justify-center sm:flex-row flex-col items-center gap-2">
                                <SearchInput />
                                <div className="flex gap-2">
                                    <ViewToggle />
                                    <FiltersDropdown />
                                    <SortingDropdown />
                                </div>
                            </div>
                            <MediaList />
                        </section>
                        <aside className="w-full md:w-[19rem] lg:w-[22rem] flex flex-col gap-4 md:sticky md:top-4 md:self-start">
                            <SidePanel />
                        </aside>
                    </main>
                </div>
                <div className="fixed bottom-6 right-6">
                    <BackToTop />
                </div>
                <MaiEasterEgg />
            </div>
        </MotionConfig>
    );
}
