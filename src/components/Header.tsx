"use client";

import { LogOut } from "lucide-react";
import { useState } from "react";
import { ModeToggle } from "~/components/DarkModeToggle";
import RepoLink from "~/components/RepoLink";
import SettingsMenu from "~/components/SettingsMenu";
import SplitText from "~/components/SplitText";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { signOut } from "~/lib/auth";
import { useSession } from "~/providers/session-provider";

export default function Header() {
    const session = useSession();

    return (
        <header className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3 sm:gap-2">
                <Avatar className="size-8 sm:size-10">
                    <AvatarImage src={session?.user.image ?? ""} alt="Profile Picture" />
                    <AvatarFallback>{session?.user.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                {session?.user.name && (
                    <SplitText
                        text={`hello, ${session.user.name}!`}
                        onLetterAnimationComplete={void 0}
                        delay={100}
                        duration={2}
                        ease="elastic.out(0.4, 0.2)"
                        splitType="chars"
                        from={{ opacity: 0, y: 40 }}
                        to={{ opacity: 1, y: 0 }}
                        threshold={0.1}
                        rootMargin="-100px"
                        textAlign="center"
                        className="text-xl sm:text-2xl text-white invisible"
                    />
                )}
            </div>
            <div className="flex items-center gap-2">
                <SettingsMenu />
                <ModeToggle />
                <RepoLink />
                <Button variant="outline" size="icon" onClick={() => signOut()}>
                    <LogOut className="w-4 h-4" />
                </Button>
            </div>
        </header>
    );
}
