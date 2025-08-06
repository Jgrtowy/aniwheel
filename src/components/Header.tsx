"use client";

import { LogOut } from "lucide-react";
import { ModeToggle } from "~/components/DarkModeToggle";
import RepoLink from "~/components/RepoLink";
import SettingsMenu from "~/components/SettingsMenu";
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
                <h1 className="text-xl sm:text-2xl text-white">{session?.user.name && <>{`hello, ${session?.user.name}!`}</>}</h1>
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
