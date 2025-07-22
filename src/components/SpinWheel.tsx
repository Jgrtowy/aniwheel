"use client";

import { ChevronDown, X } from "lucide-react";
import { useCallback, useState, useRef, useEffect } from "react";
import { useAnimeStore, useSettingsStore } from "~/lib/store";
import type { PlannedItem } from "~/lib/types";
import { Button } from "./ui/button";

export function SpinWheel() {
    const { showWheel, checkedAnime, fullAnimeList, titleLanguage, setShowWheel } = useAnimeStore();
    const { imageSize } = useSettingsStore();
    const items = fullAnimeList.filter((anime) => checkedAnime.has(anime.id));

    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [selectedItem, setSelectedItem] = useState<PlannedItem | null>(null);
    
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const animationRef = useRef<number>(0);
    const startTimeRef = useRef<number>(0);
    const startRotationRef = useRef<number>(0);
    const targetRotationRef = useRef<number>(0);
    const lastCrossedSegmentRef = useRef<number>(-1);
    const lastSoundPlayTimeRef = useRef<number>(0);

    const segmentAngle = 360 / items.length;

    const wheelRadius = 150;
    const wheelCenter = 160;

    useEffect(() => {
        audioRef.current = new Audio('/tick.mp3');
        audioRef.current.preload = 'auto';
        audioRef.current.volume = 0.3;
        
        return () => {
            if (audioRef.current) {
                audioRef.current.remove();
            }
        };
    }, []);

    const playTickSound = useCallback(() => {
        const now = performance.now();
        const soundCooldown = 25;
        
        if (audioRef.current && now - lastSoundPlayTimeRef.current >= soundCooldown) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => {
                console.warn("Failed to play sound, user interaction may be required.");
            });
            lastSoundPlayTimeRef.current = now;
        }
    }, []);

    const calculateImageDimensions = (segmentAngle: number, radius: number) => {
        const angleRad = (segmentAngle * Math.PI) / 180;

        const segmentWidth = 2 * radius * Math.sin(angleRad / 2);

        const segmentHeight = radius;

        const diagonal = Math.sqrt(segmentWidth * segmentWidth + segmentHeight * segmentHeight);

        const imageSize = diagonal * 1.2;

        return {
            width: imageSize,
            height: imageSize,
            segmentWidth,
            segmentHeight,
        };
    };

    const calculateWinner = useCallback(
        (finalRotation: number) => {
            const normalizedRotation = ((finalRotation % 360) + 360) % 360;

            const pointerPosition = (270 - normalizedRotation + 360) % 360;

            const selectedIndex = Math.floor(pointerPosition / segmentAngle) % items.length;
            return items[selectedIndex];
        },
        [items, segmentAngle, titleLanguage],
    );

    const animateRotation = useCallback((timestamp: number) => {
        if (!startTimeRef.current) {
            startTimeRef.current = timestamp;
        }

        const elapsed = timestamp - startTimeRef.current;
        const duration = 6000;
        const progress = Math.min(elapsed / duration, 1);

        const easeProgress = progress < 1 ? 
            1 - Math.pow(1 - progress, 4.5) : 1;

        const currentRotation = startRotationRef.current + 
            (targetRotationRef.current - startRotationRef.current) * easeProgress;

        setRotation(currentRotation);

        if (items.length > 0) {
            const normalizedRotation = ((currentRotation % 360) + 360) % 360;
            const pointerPosition = (270 - normalizedRotation + 360) % 360;
            const currentSegment = Math.floor(pointerPosition / segmentAngle) % items.length;

            if (currentSegment !== lastCrossedSegmentRef.current && lastCrossedSegmentRef.current !== -1) {
                playTickSound();
            }
            lastCrossedSegmentRef.current = currentSegment;
        }

        if (progress < 1) {
            animationRef.current = requestAnimationFrame(animateRotation);
        } else {
            const winner = calculateWinner(targetRotationRef.current);
            setSelectedItem(winner);
            setIsSpinning(false);
            lastCrossedSegmentRef.current = -1;
            startTimeRef.current = 0;
        }
    }, [items.length, segmentAngle, playTickSound, calculateWinner]);

    const spin = () => {
        if (isSpinning || items.length === 0) return;

        setIsSpinning(true);
        setSelectedItem(null);

        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }

        const baseRotation = 1440 + Math.random() * 1440;
        startRotationRef.current = rotation;
        targetRotationRef.current = rotation + baseRotation;
        startTimeRef.current = 0;
        lastCrossedSegmentRef.current = Math.floor(((270 - rotation + 360) % 360) / segmentAngle) % items.length;
        lastSoundPlayTimeRef.current = 0;

        animationRef.current = requestAnimationFrame(animateRotation);
    };

    useEffect(() => {
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);

    if (!showWheel) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xl flex items-center justify-center z-50 p-4" onClick={() => setShowWheel(false)}>
            <div className="rounded-lg p-6 max-w-md w-full bg-primary-foreground border" onClick={(e) => e.stopPropagation()}>
                <div className="relative w-80 h-80 mx-auto my-6">
                    <svg
                        width="320"
                        height="320"
                        className="absolute inset-0"
                        style={{
                            transform: `rotate(${rotation}deg)`,
                        }}
                    >
                        <title>wheel</title>
                        <defs>
                            {items.map((item, index) => {
                                const startAngle = index * segmentAngle;
                                const endAngle = (index + 1) * segmentAngle;
                                const largeArcFlag = segmentAngle > 180 ? 1 : 0;

                                const textRadius = wheelRadius * 0.9;
                                const x1 = wheelCenter + textRadius * Math.cos((startAngle * Math.PI) / 180);
                                const y1 = wheelCenter + textRadius * Math.sin((startAngle * Math.PI) / 180);
                                const x2 = wheelCenter + textRadius * Math.cos((endAngle * Math.PI) / 180);
                                const y2 = wheelCenter + textRadius * Math.sin((endAngle * Math.PI) / 180);

                                const pathData = [`M ${wheelCenter} ${wheelCenter}`, `L ${x1} ${y1}`, `A ${textRadius} ${textRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`, "Z"].join(" ");

                                return (
                                    <clipPath key={`text-clip-${index}`} id={`text-clip-path-${index}`}>
                                        <path d={pathData} />
                                    </clipPath>
                                );
                            })}
                        </defs>
                        {items.map((item, index) => {
                            const startAngle = index * segmentAngle;
                            const endAngle = (index + 1) * segmentAngle;
                            const largeArcFlag = segmentAngle > 180 ? 1 : 0;

                            const x1 = wheelCenter + wheelRadius * Math.cos((startAngle * Math.PI) / 180);
                            const y1 = wheelCenter + wheelRadius * Math.sin((startAngle * Math.PI) / 180);
                            const x2 = wheelCenter + wheelRadius * Math.cos((endAngle * Math.PI) / 180);
                            const y2 = wheelCenter + wheelRadius * Math.sin((endAngle * Math.PI) / 180);

                            const pathData = [`M ${wheelCenter} ${wheelCenter}`, `L ${x1} ${y1}`, `A ${wheelRadius} ${wheelRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`, "Z"].join(" ");

                            const imageDimensions = calculateImageDimensions(segmentAngle, wheelRadius);

                            const segmentCenterAngle = startAngle + segmentAngle / 2;
                            const imageX = wheelCenter + wheelRadius * 0.5 * Math.cos((segmentCenterAngle * Math.PI) / 180);
                            const imageY = wheelCenter + wheelRadius * 0.5 * Math.sin((segmentCenterAngle * Math.PI) / 180);

                            return (
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
                                        opacity="0.8"
                                    />
                                </g>
                            );
                        })}
                    </svg>

                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1">
                        <ChevronDown className="w-8 h-8 text-white absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    </div>

                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white border-4 border-gray-300 rounded-full" />
                </div>

                <div className="text-center">
                    <Button onClick={spin} disabled={isSpinning} size="lg" className="w-full">
                        {isSpinning ? "Spinning..." : "Spin!"}
                    </Button>
                </div>

                <div className="flex items-center justify-center my-4 h-12">
                    <p className="text-lg font-semibold line-clamp-2 text-center">{!selectedItem || isSpinning ? "???" : titleLanguage === "native" ? selectedItem.nativeTitle || selectedItem.title : titleLanguage === "romaji" ? selectedItem.romajiTitle || selectedItem.title : selectedItem.title}</p>
                    {selectedItem?.siteUrl && !isSpinning && (
                        <div className="">
                            <a href={selectedItem.siteUrl} target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" className="ml-4">
                                    AniList
                                </Button>
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
