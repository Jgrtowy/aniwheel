"use client";
import { LogOut } from "lucide-react";
import { useUnifiedSession } from "~/hooks/useUnifiedSession";
import { ModeToggle } from "./DarkModeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "./ui/dropdown-menu";
import SettingsMenu from "./SettingsMenu";

export default function Header() {
    const { user, logout, activeProvider } = useUnifiedSession();

    const primaryUser = Array.isArray(user) ? user[0] : user;

    return (
        <>
            <header className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                        <AvatarImage src={primaryUser?.image ?? ""} alt="Profile Picture" />
                        <AvatarFallback>{primaryUser?.name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <h1 className="text-2xl">{primaryUser?.name && <>{`hello, ${primaryUser.name}!`}</>}</h1>
                </div>
                <div className="flex items-center gap-2">
                    <SettingsMenu />
                    <ModeToggle />
                    <Button variant="outline" size="icon" className="hover:cursor-pointer" onClick={() => logout(activeProvider)}>
                        <LogOut className="w-4 h-4" />
                    </Button>
                </div>
            </header>
        </>
    );
}
