"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useSettingsStore } from "~/store/settings";

export default function MaiEasterEgg() {
    const { hasSeenMai, setHasSeenMai } = useSettingsStore();
    const maiInteracted = useRef(false);
    const [showMai, setShowMai] = useState(false);

    const handleMaiHover = () => {
        if (!showMai || maiInteracted.current) return;
        maiInteracted.current = true;
        setShowMai(false);
        setHasSeenMai(true);
        toast("You think you saw a bunny girl?", {
            description: "Congratulations, you're officially suffering from Adolescence Syndrome.",
            duration: 5000,
            position: "bottom-center",
            className: "justify-center text-center [&_[data-title]]:text-lg [&_[data-title]]:font-black! [&_[data-description]]:text-sm",
        });
    };

    useEffect(() => {
        if (hasSeenMai) {
            setShowMai(false);
            return;
        }

        let isActive = true;

        (async () => {
            try {
                const response = await fetch("/api/maiEligibility");
                if (!response.ok) {
                    if (isActive) setShowMai(false);
                    return;
                }

                const data = (await response.json()) as { showMai?: boolean };
                if (isActive) setShowMai(Boolean(data.showMai));
            } catch (error) {
                if (isActive) setShowMai(false);
                console.error("Failed to check Mai eligibility", error);
            }
        })();

        return () => {
            isActive = false;
        };
    }, [hasSeenMai]);

    return (
        <AnimatePresence>
            {showMai && (
                <motion.div
                    className="absolute bottom-0 left-2 cursor-help"
                    onHoverStart={handleMaiHover}
                    onTapStart={handleMaiHover}
                    initial={{ opacity: 0, filter: "blur(0px)" }}
                    animate={{ opacity: 1, transition: { duration: 0.5, ease: "easeInOut" } }}
                    exit={{ opacity: 0, filter: "blur(100px)", transition: { duration: 1.5, ease: "easeInOut" } }}
                >
                    <Image className="w-24" src="/mai.webp" alt="Some strange bunny girl" width={750} height={1000} />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
