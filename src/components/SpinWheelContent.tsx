import { Howl } from "howler";
import { Building2, ChevronDown, Clapperboard, Clock, ExternalLink, Star } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import LightRays from "~/components/LightRays";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import useMediaQuery from "~/hooks/useMediaQuery";
import type { MediaItem } from "~/lib/types";
import { cn, getImageUrlWithPreference, getPrettyMediaFormat, getPrettyProviderName, getTitleWithPreference } from "~/lib/utils";
import { useSession } from "~/providers/session-provider";
import { useAnimeStore } from "~/store/anime";
import { useSettingsStore } from "~/store/settings";
import { Badge } from "./ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

const calculateImageDimensions = (segmentAngle: number, radius: number) => {
    const angleRad = (segmentAngle * Math.PI) / 180;
    const segmentWidth = 2 * radius * Math.sin(angleRad / 2);
    const segmentHeight = radius;
    const diagonal = Math.sqrt(segmentWidth * segmentWidth + segmentHeight * segmentHeight);
    const imageSize = diagonal * 1.2;

    return { width: imageSize, height: imageSize, segmentWidth, segmentHeight };
};

const WHEEL_SIZE_MOBILE = 200;
const WHEEL_SIZE_TABLET = 275;
const WHEEL_SIZE_DESKTOP = 375;

const ANIMATION_DURATION = 10000; // 10 seconds
const EASEING_FUNCTION = "cubic-bezier(0.2, -0.2, 0.05, 1)";
const BASE_ROTATION_MIN = 1440; // Minimum 4 full rotations
const BASE_ROTATION_RANGE = 1440; // Additional random rotations

const TICK_SOUND_DELAY = 30;

export function SpinWheelContent() {
    const { selectedMedia, fullMediaList } = useAnimeStore();
    const { enableTickSounds } = useSettingsStore();
    const items = fullMediaList.filter((anime) => selectedMedia.has(anime.id));

    const session = useSession();

    const isMobile = useMediaQuery("(max-width: 640px)");
    const isTablet = useMediaQuery("(max-width: 1024px)");

    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);

    const wheelRef = useRef<SVGSVGElement>(null);
    const currentAnimationRef = useRef<Animation | null>(null);

    const tickSoundRef = useRef<Howl | null>(null);
    const lastTickTimeRef = useRef<number>(0);
    const lastCrossedSegmentRef = useRef<number>(-1);

    useEffect(() => {
        let animationFrameId: number;

        const idleSpin = () => {
            if (!isSpinning && !selectedItem) return;
            setRotation((prev) => (prev + 0.05) % 360);
            animationFrameId = requestAnimationFrame(idleSpin);
        };

        if (items.length > 0) animationFrameId = requestAnimationFrame(idleSpin);

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [isSpinning, selectedItem, items.length]);

    const wheelSize = useMemo(() => {
        if (isMobile) return WHEEL_SIZE_MOBILE;
        if (isTablet) return WHEEL_SIZE_TABLET;
        return WHEEL_SIZE_DESKTOP;
    }, [isMobile, isTablet]);

    const WHEEL_RADIUS = wheelSize * 0.5;
    const WHEEL_CENTER = wheelSize * 0.5;
    const segmentAngle = 360 / items.length;

    useEffect(() => {
        if (!enableTickSounds) {
            tickSoundRef.current?.unload();
            return;
        }

        tickSoundRef.current = new Howl({ src: ["/tick.mp3"] });

        return () => {
            tickSoundRef.current?.unload();
        };
    }, [enableTickSounds]);

    const playTickSound = useCallback(() => {
        if (!tickSoundRef.current) return;

        const now = Date.now();
        if (now - lastTickTimeRef.current < TICK_SOUND_DELAY) return;

        tickSoundRef.current.play();
        lastTickTimeRef.current = now;
    }, []);

    const checkSegmentCrossing = useCallback(
        (currentRotation: number) => {
            if (items.length === 0) return;

            const normalizedRotation = ((currentRotation % 360) + 360) % 360;
            const pointerPosition = (270 - normalizedRotation + 360) % 360;
            const currentSegment = Math.floor(pointerPosition / segmentAngle) % items.length;

            if (lastCrossedSegmentRef.current !== -1 && currentSegment !== lastCrossedSegmentRef.current) playTickSound();

            lastCrossedSegmentRef.current = currentSegment;
        },
        [items.length, segmentAngle, playTickSound],
    );

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
        [items, segmentAngle],
    );

    const spin = () => {
        if (isSpinning || items.length === 0) return;

        setIsSpinning(true);
        setSelectedItem(null);

        const normalizedCurrentRotation = ((rotation % 360) + 360) % 360;
        const currentPointerPosition = (270 - normalizedCurrentRotation + 360) % 360;
        lastCrossedSegmentRef.current = Math.floor(currentPointerPosition / segmentAngle) % items.length;

        if (currentAnimationRef.current) currentAnimationRef.current.cancel();

        const baseRotation = BASE_ROTATION_MIN + Math.random() * BASE_ROTATION_RANGE;
        const targetRotation = rotation + baseRotation;

        if (wheelRef.current) {
            const animation = wheelRef.current.animate([{ transform: `rotate(${rotation}deg)` }, { transform: `rotate(${targetRotation}deg)` }], { duration: ANIMATION_DURATION, easing: EASEING_FUNCTION, fill: "forwards" });

            currentAnimationRef.current = animation;

            const startRotation = rotation;

            const trackRotation = () => {
                if (!animation || animation.playState === "finished") return;

                const timing = animation.effect?.getComputedTiming();
                if (timing && typeof timing.progress === "number") {
                    const currentRotation = startRotation + (targetRotation - startRotation) * timing.progress;
                    checkSegmentCrossing(currentRotation);
                }

                requestAnimationFrame(trackRotation);
            };

            requestAnimationFrame(trackRotation);

            animation.addEventListener("finish", () => {
                const winner = calculateWinner(targetRotation);
                setSelectedItem(winner);
                setIsSpinning(false);
                setRotation(targetRotation % 360);
            });
        }
    };

    useEffect(() => {
        return () => {
            currentAnimationRef.current?.cancel();
            tickSoundRef.current?.unload();
        };
    }, []);

    const mainStudios = selectedItem?.studios.filter((studio) => studio.isMain) || [];
    const producerStudios = selectedItem?.studios.filter((studio) => !studio.isMain) || [];

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
                        animate={{ scale: selectedItem ? 1 : isMobile || isTablet ? 1.6 : 1.3 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30, duration: 0.2 }}
                    >
                        <img src="/Click_to_spin.svg" alt="Click to spin!" className={cn("absolute inset-0 object-cover z-10 rounded-full opacity-100 pointer-events-none transition-opacity", isSpinning && "opacity-0")} />
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
                                    <image href={getImageUrlWithPreference(item, "large")} x={imageX - imageDimensions.width / 2} y={imageY - imageDimensions.height / 2} width={imageDimensions.width} height={imageDimensions.height} preserveAspectRatio="xMidYMid slice" clipPath={`url(#clip-path-${index})`} />
                                </g>
                            ))}
                        </svg>
                        <ChevronDown strokeWidth={2} className="size-12 lg:w-16 lg:h-16 absolute -top-10 lg:-top-13 left-1/2 text-primary-foreground -translate-x-1/2" />
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
                                <div className="relative w-full h-72 lg:h-96 rounded-xl overflow-hidden">
                                    <Image className="object-cover" src={getImageUrlWithPreference(selectedItem, "extraLarge")} alt={getTitleWithPreference(selectedItem)} fill />
                                    <div className="absolute bottom-0 w-full h-3/6 bg-gradient-to-t from-black/95 to-transparent" />
                                    <div className="absolute bottom-0 left-0 right-0 flex flex-col gap-1 p-4">
                                        <h3 className="text-lg lg:text-xl font-black text-primary-foreground line-clamp-2">{getTitleWithPreference(selectedItem)}</h3>
                                        <div className="flex flex-wrap gap-1">
                                            <Badge variant="outline" className="bg-component-primary tracking-tight icon-text-container" key="format">
                                                <p>{getPrettyMediaFormat(selectedItem.format)}</p>
                                                <span className="sr-only">Media format</span>
                                            </Badge>
                                            {selectedItem.averageScore && (
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Badge variant="outline" className="bg-component-primary tracking-tight icon-text-container">
                                                            <Star className="size-3" />
                                                            <p>{selectedItem.averageScore}</p>
                                                            <span className="sr-only">Average score</span>
                                                        </Badge>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Weighted user average score</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            )}
                                            {selectedItem.episodes > 0 && (
                                                <Tooltip key="episodes">
                                                    <TooltipTrigger asChild>
                                                        <Badge variant="outline" className="bg-component-primary tracking-tight icon-text-container">
                                                            <Clapperboard className="size-3" />
                                                            <p>
                                                                {selectedItem.episodes} {selectedItem.episodes === 1 ? "ep" : "eps"}
                                                            </p>
                                                            <span className="sr-only">Number of episodes</span>
                                                        </Badge>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Total number of episodes</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            )}
                                            {selectedItem.studios.length > 0 && (
                                                <Tooltip key="studios">
                                                    <TooltipTrigger asChild>
                                                        <Badge variant="outline" className="bg-component-primary tracking-tight icon-text-container">
                                                            <Building2 className="size-3" />
                                                            <p>{mainStudios.map((studio) => studio.name).join(", ")}</p>
                                                            <span className="sr-only">Studios</span>
                                                        </Badge>
                                                    </TooltipTrigger>
                                                    <TooltipContent className="flex flex-col gap-2">
                                                        <div className="mb-1">
                                                            <h6 className="font-bold text-sm">Studios:</h6>
                                                            {mainStudios.map((studio) => (
                                                                <p key={studio.name}>{studio.name}</p>
                                                            ))}
                                                        </div>
                                                        {producerStudios.length > 0 && (
                                                            <div className="mb-1">
                                                                <h6 className="font-bold text-sm">Producers:</h6>
                                                                {producerStudios.map((studio) => (
                                                                    <p key={studio.name}>{studio.name}</p>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </TooltipContent>
                                                </Tooltip>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <CardContent className="p-3 lg:p-4">
                                    <Button asChild className="w-full" size="lg">
                                        <a href={selectedItem.siteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 icon-text-container">
                                            {session?.activeProvider && <span className="text-sm lg:text-base">View on {getPrettyProviderName(session?.activeProvider)}</span>}
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
