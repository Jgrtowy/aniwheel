"use client";

import { ChevronDown, ExternalLink, Star } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import LightRays from "~/components/LightRays";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import useMediaQuery from "~/hooks/useMediaQuery";
import { useUnifiedSession } from "~/hooks/useUnifiedSession";
import { useAnimeStore, useSettingsStore } from "~/lib/store";
import type { PlannedItem } from "~/lib/types";
import { cn } from "~/lib/utils";
import { authOptions } from "~/server/auth";

const calculateImageDimensions = (segmentAngle: number, radius: number) => {
    const angleRad = (segmentAngle * Math.PI) / 180;
    const segmentWidth = 2 * radius * Math.sin(angleRad / 2);
    const segmentHeight = radius;
    const diagonal = Math.sqrt(segmentWidth * segmentWidth + segmentHeight * segmentHeight);
    const imageSize = diagonal * 1.2;

    return { width: imageSize, height: imageSize, segmentWidth, segmentHeight };
};

// Responsive wheel sizes for different screen sizes
const WHEEL_SIZE_MOBILE = 280;
const WHEEL_SIZE_TABLET = 350;
const WHEEL_SIZE_DESKTOP = 375;

const ANIMATION_DURATION = 10000; // 10 seconds
const EASEING_FUNCTION = "cubic-bezier(0.2, -0.2, 0.05, 1)";
const BASE_ROTATION_MIN = 1440; // Minimum 4 full rotations
const BASE_ROTATION_RANGE = 1440; // Additional random rotations

export function SpinWheelContent() {
    const { checkedAnime, fullAnimeList, titleLanguage } = useAnimeStore();
    const { imageSize } = useSettingsStore();
    const items = fullAnimeList.filter((anime) => checkedAnime.has(anime.id));

    const { activeProvider } = useUnifiedSession();

    // Media queries for responsive design
    const isMobile = useMediaQuery("(max-width: 640px)");
    const isTablet = useMediaQuery("(max-width: 1024px)");

    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [selectedItem, setSelectedItem] = useState<PlannedItem | null>(null);

    const wheelRef = useRef<SVGSVGElement>(null);
    const currentAnimationRef = useRef<Animation | null>(null);

    // Calculate responsive wheel size
    const wheelSize = useMemo(() => {
        if (isMobile) return WHEEL_SIZE_MOBILE;
        if (isTablet) return WHEEL_SIZE_TABLET;
        return WHEEL_SIZE_DESKTOP;
    }, [isMobile, isTablet]);

    const WHEEL_RADIUS = wheelSize * 0.5;
    const WHEEL_CENTER = wheelSize * 0.5;
    const segmentAngle = 360 / items.length;

    const wheelSegments = useMemo(() => {
        return items.map((item, index) => {
            const startAngle = index * segmentAngle;
            const endAngle = (index + 1) * segmentAngle;
            const largeArcFlag = segmentAngle > 180 ? 1 : 0;

            const x1 = WHEEL_CENTER + WHEEL_RADIUS * Math.cos((startAngle * Math.PI) / 180);
            const y1 = WHEEL_CENTER + WHEEL_RADIUS * Math.sin((startAngle * Math.PI) / 180);
            const x2 = WHEEL_CENTER + WHEEL_RADIUS * Math.cos((endAngle * Math.PI) / 180);
            const y2 = WHEEL_CENTER + WHEEL_RADIUS * Math.sin((endAngle * Math.PI) / 180);

            const pathData = [`M ${WHEEL_CENTER} ${WHEEL_CENTER}`, `L ${x1} ${y1}`, `A ${WHEEL_RADIUS} ${WHEEL_RADIUS} 0 ${largeArcFlag} 1 ${x2} ${y2}`, "Z"].join(" ");

            const imageDimensions = calculateImageDimensions(segmentAngle, WHEEL_RADIUS);

            const segmentCenterAngle = startAngle + segmentAngle / 2;
            const imageX = WHEEL_CENTER + WHEEL_RADIUS * 0.5 * Math.cos((segmentCenterAngle * Math.PI) / 180);
            const imageY = WHEEL_CENTER + WHEEL_RADIUS * 0.5 * Math.sin((segmentCenterAngle * Math.PI) / 180);

            const textRadius = WHEEL_RADIUS * 0.9;
            const textX1 = WHEEL_CENTER + textRadius * Math.cos((startAngle * Math.PI) / 180);
            const textY1 = WHEEL_CENTER + textRadius * Math.sin((startAngle * Math.PI) / 180);
            const textX2 = WHEEL_CENTER + textRadius * Math.cos((endAngle * Math.PI) / 180);
            const textY2 = WHEEL_CENTER + textRadius * Math.sin((endAngle * Math.PI) / 180);
            const textPathData = [`M ${WHEEL_CENTER} ${WHEEL_CENTER}`, `L ${textX1} ${textY1}`, `A ${textRadius} ${textRadius} 0 ${largeArcFlag} 1 ${textX2} ${textY2}`, "Z"].join(" ");

            return { item, index, pathData, textPathData, imageDimensions, imageX, imageY, largeArcFlag };
        });
    }, [items, segmentAngle]);

    const calculateWinner = useCallback(
        (finalRotation: number) => {
            const normalizedRotation = ((finalRotation % 360) + 360) % 360;
            const pointerPosition = (270 - normalizedRotation + 360) % 360;
            const selectedIndex = Math.floor(pointerPosition / segmentAngle) % items.length;
            return items[selectedIndex];
        },
        [items, segmentAngle, titleLanguage],
    );

    const spin = () => {
        if (isSpinning || items.length === 0) return;

        setIsSpinning(true);
        setSelectedItem(null);

        if (currentAnimationRef.current) currentAnimationRef.current.cancel();

        const baseRotation = BASE_ROTATION_MIN + Math.random() * BASE_ROTATION_RANGE;
        const targetRotation = rotation + baseRotation;

        if (wheelRef.current) {
            const animation = wheelRef.current.animate([{ transform: `rotate(${rotation}deg)` }, { transform: `rotate(${targetRotation}deg)` }], { duration: ANIMATION_DURATION, easing: EASEING_FUNCTION, fill: "forwards" });

            currentAnimationRef.current = animation;

            animation.addEventListener("finish", () => {
                const winner = calculateWinner(targetRotation);
                setSelectedItem(winner);
                setIsSpinning(false);
                setRotation(targetRotation % 360);
            });
        }
    };

    useEffect(() => {
        return () => currentAnimationRef.current?.cancel();
    }, []);

    useEffect(() => {
        console.log(selectedItem);
    }, [selectedItem]);

    return (
        <>
            <AnimatePresence>
                {selectedItem && (
                    <motion.div className="inset-0 fixed pointer-events-none -z-10" initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} transition={{ duration: 1, ease: "easeInOut" }}>
                        <LightRays raysOrigin="top-center" raysColor="#ffffff" raysSpeed={1.5} lightSpread={1} rayLength={5} followMouse={true} mouseInfluence={0.05} noiseAmount={0.1} distortion={0.05} />
                    </motion.div>
                )}
            </AnimatePresence>
            <motion.div layout className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 p-4" transition={{ type: "spring", stiffness: 300, damping: 30 }}>
                <AnimatePresence initial={false}>
                    <motion.button
                        key="spin-wheel"
                        className="relative cursor-pointer rounded-full appearance-none"
                        style={{ width: `${wheelSize}px`, height: `${wheelSize}px` }}
                        type="button"
                        onClick={spin}
                        disabled={isSpinning}
                        aria-label={isSpinning ? "Spinning..." : "Spin the wheel!"}
                        layout
                        animate={{ scale: selectedItem ? 1 : isMobile ? 1.1 : 1.25 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30, duration: 0.2 }}
                    >
                        <img src="/Click_to_spin.svg" alt="Click to spin!" className={cn("absolute inset-0 w-full h-full object-cover z-10 rounded-full opacity-100 pointer-events-none transition-opacity", isSpinning && "opacity-0")} />
                        <svg ref={wheelRef} width="100%" height="100%" viewBox={`0 0 ${wheelSize} ${wheelSize}`} className="absolute inset-0 overflow-hidden rounded-full" style={{ transform: `rotate(${rotation}deg)` }}>
                            <title>{isSpinning ? "Spinning..." : "Click to spin the wheel!"}</title>
                            <defs>
                                {wheelSegments.map(({ textPathData }, index) => (
                                    <clipPath key={`text-clip-${index}`} id={`text-clip-path-${index}`}>
                                        <path d={textPathData} />
                                    </clipPath>
                                ))}
                            </defs>
                            {wheelSegments.map(({ item, index, pathData, imageDimensions, imageX, imageY }) => (
                                <g key={index}>
                                    <path d={pathData} fill="black" stroke="white" strokeWidth="2" />
                                    <clipPath id={`clip-path-${index}`}>
                                        <path d={pathData} />
                                    </clipPath>
                                    <image
                                        href={item.image?.[imageSize] || item.imageMal?.[imageSize === "extraLarge" ? "large" : imageSize] || ""}
                                        x={imageX - imageDimensions.width / 2}
                                        y={imageY - imageDimensions.height / 2}
                                        width={imageDimensions.width}
                                        height={imageDimensions.height}
                                        preserveAspectRatio="xMidYMid slice"
                                        clipPath={`url(#clip-path-${index})`}
                                    />
                                </g>
                            ))}
                        </svg>
                        <ChevronDown strokeWidth={2} className="w-12 h-12 lg:w-16 lg:h-16 absolute -top-10 lg:-top-13 left-1/2 -translate-x-1/2" />
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 lg:w-8 lg:h-8 bg-white border-2 lg:border-4 border-gray-300 rounded-full" />
                    </motion.button>
                    {selectedItem && (
                        <motion.div
                            key="selected-item"
                            layout
                            className="flex justify-center w-full lg:w-auto max-w-sm lg:max-w-none"
                            initial={{ opacity: 0, x: isMobile ? 0 : 50, y: isMobile ? 50 : 0 }}
                            animate={{ opacity: 1, x: 0, y: 0 }}
                            exit={{ opacity: 0, x: isMobile ? 0 : 50, y: isMobile ? 50 : 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        >
                            <Card className="w-72 lg:w-80 overflow-hidden shadow-2xl p-0 gap-0">
                                <div className="relative">
                                    <img src={selectedItem.image?.[imageSize]} alt={selectedItem.title} className="w-full h-72 lg:h-96 object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-card/95 via-card/60 to-transparent" />
                                    <div className="absolute bottom-0 left-0 right-0 text-primary flex flex-col gap-2 p-2 pb-4">
                                        <h3 className="text-xl lg:text-2xl font-bold line-clamp-2">{selectedItem.title}</h3>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {selectedItem.averageScore && (
                                                <Badge variant="secondary" className="bg-yellow-500 text-accent">
                                                    <Star className="w-3 h-3 lg:w-4 lg:h-4" /> <span className="translate-y-0.25">{selectedItem.averageScore}%</span>
                                                </Badge>
                                            )}
                                            {selectedItem.episodes && (
                                                <Badge variant="secondary" className="bg-blue-500 text-primary">
                                                    {selectedItem.episodes} episode{selectedItem.episodes > 1 ? "s" : ""}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <CardContent className="p-3 lg:p-4">
                                    <Button asChild className="w-full" size="lg">
                                        <a href={selectedItem.siteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                                            <span className="translate-y-0.25 text-sm lg:text-base">{authOptions.providers.find((p) => p.id === activeProvider)?.name || activeProvider}</span>
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </>
    );
}
