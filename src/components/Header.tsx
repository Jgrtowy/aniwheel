"use client";

import { ExternalLink, LogOut, ShieldHalf } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import KanjiAnimation from "~/components/KanjiAnimation";
import RepoLink from "~/components/RepoLink";
import SettingsMenu from "~/components/SettingsMenu";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { Separator } from "~/components/ui/separator";
import { signOut } from "~/lib/auth";
import type { MediaItem } from "~/lib/types";
import { getPrettyProviderName } from "~/lib/utils";
import { useSession } from "~/providers/session-provider";
import { useAnimeStore } from "~/store/anime";

export default function Header() {
    const session = useSession();
    const reduceMotion = useReducedMotion() ?? false;
    const { fullMediaList } = useAnimeStore();

    const [showHeading, setShowHeading] = useState(false);

    const statusesCount = fullMediaList.reduce(
        (acc, media) => {
            if (!media.status) return acc;
            acc[media.status] = (acc[media.status] || 0) + 1;
            return acc;
        },
        {} as Record<NonNullable<MediaItem["status"]>, number>,
    );

    return (
        <header className="flex items-center justify-between bg-component-primary p-4 rounded-xl border">
            <h1 className="flex items-center gap-2 font-bold text-xl sm:text-2xl">
                <KanjiAnimation className="shrink-0 size-9 sm:size-10" duration={0.125} delayBetween={0.01} strokeWidth={5} skipAnimation={reduceMotion} onAnimationComplete={() => setShowHeading(true)} />
                <AnimatePresence>
                    {showHeading && (
                        <motion.span initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }}>
                            Aniwheel
                        </motion.span>
                    )}
                </AnimatePresence>
            </h1>
            <div className="flex items-center gap-2">
                <SettingsMenu />
                <Popover open={session ? undefined : false}>
                    <PopoverTrigger className="size-9 sm:size-10 rounded-full flex justify-center items-center cursor-pointer">
                        <Avatar className="box-border shadow-[0_0_0_2px_var(--background),0_0_0_4px_var(--primary)]">
                            <AvatarImage src={session?.user.image} alt={session?.user.name} />
                            <AvatarFallback>{session?.user.name?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0 bg-component-secondary" align="end">
                        <div className="p-4">
                            <div className="flex items-center gap-3">
                                <Avatar className="size-11">
                                    <AvatarImage src={session?.user.image} alt={session?.user.name} />
                                    <AvatarFallback className="bg-primary text-primary-foreground">{session?.user.name?.charAt(0) || "U"}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <a className="font-semibold text-sm truncate flex items-center gap-1 hover:underline underline-offset-2" href={session?.user.url} target="_blank" rel="noopener noreferrer">
                                        {session?.user.name}
                                        <ExternalLink className="size-3" />
                                    </a>
                                    {session && (
                                        <div className="text-xs text-muted-foreground">
                                            <p>
                                                {statusesCount.PLANNING} planning &bull; {statusesCount.PAUSED} paused &bull; {statusesCount.DROPPED} dropped
                                            </p>
                                            <p>Member since {new Date(session.user.createdAt * 1000).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</p>
                                            <p>Signed in with {getPrettyProviderName(session?.activeProvider)}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <Separator />
                        <div className="grid p-2">
                            <Button variant="ghost" className="justify-start" asChild>
                                <RepoLink>View Repository</RepoLink>
                            </Button>
                            <Button variant="ghost" className="justify-start" asChild>
                                <Link href="/privacy">
                                    <ShieldHalf className="h-4 w-4" />
                                    Privacy Policy
                                </Link>
                            </Button>
                            <Button variant="ghost" className="justify-start text-destructive hover:text-destructive" onClick={() => signOut()}>
                                <LogOut className="h-4 w-4" />
                                Sign Out
                            </Button>
                        </div>
                        {session && session.activeProvider === "anilist" && session.user.anilist?.moderatorRoles && (
                            <>
                                <Separator />
                                <div className="p-4">
                                    <p className="text-sm italic font-bold">Hey there moderator!</p>
                                    <p className="text-xs">Thank you for making AniList better for all of us. 💗</p>
                                </div>
                            </>
                        )}
                    </PopoverContent>
                </Popover>
            </div>
        </header>
    );
}
