"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import Aurora from "~/components/Aurora";
import KanjiAnimation from "~/components/KanjiAnimation";
import { Button } from "~/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";
import { useReducedMotion } from "~/hooks/useReducedMotion";
import { type UserProfile, useUnifiedSession } from "~/hooks/useUnifiedSession";
import { useSettingsStore } from "~/lib/store";
import PlaceholderWheel from "./PlaceholderWheel";

export default function Landing() {
    const [kanjiPathAnimationComplete, setKanjiPathAnimationComplete] = useState(false);
    const [renderTitle, setRenderTitle] = useState(false);
    const [renderButtons, setRenderButtons] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const prefersReducedMotion = useReducedMotion();
    const { skipLandingAnimation } = useSettingsStore();
    const shouldSkipAnimations = prefersReducedMotion || skipLandingAnimation;

    const kanjiSizeTransitionDuration = 0.4;
    const titleAnimationDuration = 0.6;

    useEffect(() => {
        if (shouldSkipAnimations) {
            setKanjiPathAnimationComplete(true);
            setRenderTitle(true);
            setRenderButtons(true);
        }
    }, [shouldSkipAnimations]);

    const handleKanjiPathAnimationComplete = async () => {
        if (shouldSkipAnimations) {
            setKanjiPathAnimationComplete(true);
            setRenderTitle(true);
            setRenderButtons(true);
            return;
        }

        setKanjiPathAnimationComplete(true);
        await new Promise((resolve) => setTimeout(resolve, kanjiSizeTransitionDuration * 1000));
        setRenderTitle(true);
        await new Promise((resolve) => setTimeout(resolve, titleAnimationDuration * 1000 + 250));
        setRenderButtons(true);
    };

    const { login } = useUnifiedSession();

    const handleLogin = async (provider: UserProfile["provider"]) => {
        setIsLoggingIn(true);
        try {
            login(provider);
        } catch (error) {
            setIsLoggingIn(false);
        }
    };

    return (
        <div className="flex items-center justify-center flex-col">
            <motion.div className="flex items-center justify-center gap-4" layout={!shouldSkipAnimations}>
                <motion.div layout={!shouldSkipAnimations} transition={!shouldSkipAnimations ? { type: "spring", stiffness: 300, damping: 30 } : { duration: 0 }} className="flex">
                    <Tooltip>
                        <TooltipTrigger>
                            <KanjiAnimation
                                className={`flex-shrink-0 transition ${shouldSkipAnimations ? "" : `duration-[${kanjiSizeTransitionDuration * 1000}ms]`} ${kanjiPathAnimationComplete ? "scale-100" : shouldSkipAnimations ? "scale-100" : "scale-[300%]"}`}
                                size={100}
                                duration={shouldSkipAnimations ? 0 : 0.175}
                                delayBetween={shouldSkipAnimations ? 0 : 0.01}
                                strokeWidth={5}
                                onAnimationComplete={handleKanjiPathAnimationComplete}
                            />
                        </TooltipTrigger>
                        {(renderButtons || shouldSkipAnimations) && (
                            <TooltipContent>
                                <p>(うん) - luck/fate</p>
                            </TooltipContent>
                        )}
                    </Tooltip>
                </motion.div>

                <AnimatePresence>
                    {(renderTitle || shouldSkipAnimations) && (
                        <motion.h1
                            layout={!shouldSkipAnimations}
                            initial={shouldSkipAnimations ? undefined : { opacity: 0, x: 60 }}
                            animate={shouldSkipAnimations ? undefined : { opacity: 1, x: 0 }}
                            exit={shouldSkipAnimations ? undefined : { opacity: 0 }}
                            transition={shouldSkipAnimations ? { duration: 0 } : { duration: titleAnimationDuration }}
                            className="text-7xl font-bold text-center"
                        >
                            Aniwheel
                        </motion.h1>
                    )}
                </AnimatePresence>
            </motion.div>

            <AnimatePresence>
                {(renderButtons || shouldSkipAnimations) && (
                    <motion.div
                        layout={!shouldSkipAnimations}
                        initial={shouldSkipAnimations ? undefined : { opacity: 0 }}
                        animate={shouldSkipAnimations ? undefined : { opacity: 1 }}
                        exit={shouldSkipAnimations ? undefined : { opacity: 0 }}
                        transition={shouldSkipAnimations ? { duration: 0 } : { duration: titleAnimationDuration, delay: titleAnimationDuration / 2 }}
                        className="flex flex-col items-center justify-center gap-4"
                    >
                        <div className="flex flex-col items-center gap-1 mt-4 text-center">
                            <p className="text-4xl font-semibold">Stuck on what anime to watch next?</p>
                            <p className="text-lg">
                                Log in with your favorite tracker and let <span className="peer">fate</span> pick your next binge!
                                <Image src="/Rider_of_black.webp" alt="Rider of Black" width={150} height={150} className="fixed rotate-45 transition-[750ms] -bottom-69 -left-36 peer-hover:-bottom-23 peer-hover:-left-12" />
                            </p>
                        </div>
                        <div className="flex sm:flex-row flex-col gap-4">
                            <div className="flex flex-col items-center gap-2">
                                <Button variant="outline" className="px-5 py-6 text-xl cursor-pointer" onClick={async () => handleLogin("anilist")} disabled={isLoggingIn}>
                                    AniList
                                </Button>
                                <span className="text-xs text-muted-foreground">most features</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <Button variant="outline" className="px-5 py-6 text-xl cursor-pointer" onClick={async () => handleLogin("myanimelist")} disabled={isLoggingIn}>
                                    MyAnimeList
                                </Button>
                                <span className="text-xs text-muted-foreground">less features</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <Button variant="outline" className="px-5 py-6 text-xl cursor-not-allowed" disabled>
                                    Kitsu
                                </Button>
                                <span className="text-xs text-muted-foreground">stay tuned</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {(renderTitle || shouldSkipAnimations) && (
                    <motion.div
                        layout={!shouldSkipAnimations}
                        initial={shouldSkipAnimations ? undefined : { opacity: 0, y: -300 }}
                        animate={shouldSkipAnimations ? undefined : { opacity: 0.5, y: 0 }}
                        exit={shouldSkipAnimations ? undefined : { opacity: 0 }}
                        transition={shouldSkipAnimations ? { duration: 0 } : { duration: titleAnimationDuration * 4 }}
                        className="fixed top-0 inset-0 -z-10 pointer-events-none"
                    >
                        <Aurora colorStops={["#3A29FF", "#FF94B4", "#FF3232"]} blend={0.75} amplitude={0.75} speed={0.4} />
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {(renderButtons || shouldSkipAnimations) && (
                    <motion.div
                        layout={!shouldSkipAnimations}
                        initial={shouldSkipAnimations ? undefined : { opacity: 0 }}
                        animate={shouldSkipAnimations ? undefined : { opacity: 1 }}
                        exit={shouldSkipAnimations ? undefined : { opacity: 0 }}
                        transition={shouldSkipAnimations ? { duration: 0 } : { duration: titleAnimationDuration, delay: titleAnimationDuration / 2 }}
                        className="fixed -rotate-45 bottom-0 right-0 translate-x-1/3 translate-y-1/3 z-10 hover:translate-x-1/4 hover:translate-y-1/4 transition-all duration-300"
                    >
                        <div className="opacity-25 hover:opacity-100 transition-opacity duration-300">
                            <PlaceholderWheel />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
