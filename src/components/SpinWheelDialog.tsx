import { DialogClose } from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Shuffle, X, XIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { SpinWheelContent } from "~/components/SpinWheelContent";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogOverlay, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { useAnimeStore, useSettingsStore } from "~/lib/store";

export function SpinWheelDialog() {
    const { fullAnimeList, checkedAnime, titleLanguage } = useAnimeStore();
    const { imageSize, enableTickSounds } = useSettingsStore();

    const selectedAnime = fullAnimeList.filter((anime) => checkedAnime.has(anime.id));

    const isDisabled = selectedAnime.length < 2;

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button disabled={isDisabled} size="lg" className="w-full">
                    <Shuffle className="w-5 h-5 mr-2" />
                    Spin the wheel!
                </Button>
            </DialogTrigger>
            <DialogOverlay className="backdrop-blur-xl" />
            <DialogContent className="h-dvh w-dvw max-w-dvw sm:max-w-dvw overflow-hidden bg-transparent border-none p-0" showCloseButton={false}>
                <VisuallyHidden>
                    <DialogHeader>
                        <DialogTitle>Spin Wheel Dialog</DialogTitle>
                    </DialogHeader>
                </VisuallyHidden>
                <SpinWheelContent />
                <DialogClose asChild>
                    <Button variant="outline" className="absolute top-2 right-2 lg:top-4 lg:right-4 h-10 w-10 lg:h-12 lg:w-12 z-50">
                        <XIcon className="w-5 h-5 lg:w-6 lg:h-6" />
                        <span className="sr-only">Close</span>
                    </Button>
                </DialogClose>
            </DialogContent>
        </Dialog>
    );
}
