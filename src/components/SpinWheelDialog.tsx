import { DialogClose, DialogDescription } from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Shuffle, XIcon } from "lucide-react";
import { SpinWheelContent } from "~/components/SpinWheelContent";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogOverlay, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { useAnimeStore } from "~/lib/store";

export function SpinWheelDialog() {
    const { fullAnimeList, checkedAnime } = useAnimeStore();

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
                        <DialogDescription>Spin the wheel to randomly select an anime from your list.</DialogDescription>
                    </DialogHeader>
                </VisuallyHidden>
                <SpinWheelContent />
                <DialogClose asChild>
                    <Button variant="outline" className="fixed top-2 right-2 lg:top-4 lg:right-4 h-10 w-10 lg:h-12 lg:w-12 z-10 cursor-pointer">
                        <XIcon className="size-5 lg:size-6" />
                        <span className="sr-only">Close dialog</span>
                    </Button>
                </DialogClose>
            </DialogContent>
        </Dialog>
    );
}
