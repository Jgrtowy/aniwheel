"use client";

import { LogOut } from "lucide-react";
import RepoLink from "~/components/RepoLink";
import SettingsMenu from "~/components/SettingsMenu";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { signOut } from "~/lib/auth";
import { useSession } from "~/providers/session-provider";

export default function Header() {
    const session = useSession();

    return (
        <header className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
                <Avatar className="size-8 sm:size-10">
                    <AvatarImage src={session?.user.image ?? ""} alt="Profile Picture" />
                    <AvatarFallback>{session?.user.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <h1 className="text-lg sm:text-2xl text-primary-foreground leading-tight">{!session ? "hello!" : `hello, ${session.user.name}!`}</h1>
            </div>
            <div className="flex items-center gap-2">
                <SettingsMenu />
                <RepoLink className="size-9 sm:size-10" />
                <Button variant="outline" className="size-9 sm:size-10" onClick={() => signOut()}>
                    <LogOut />
                </Button>
            </div>
        </header>
    );
}
