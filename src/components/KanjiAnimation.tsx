"use client";

import { useEffect, useRef } from "react";

interface KanjiAnimationProps {
    className?: string;
    size?: number;
    duration?: number;
    delayBetween?: number;
    strokeWidth?: number;
    onAnimationComplete?: () => void;
}

const pathData = [
    "M42.88,15.75c-0.1,3.3-2.52,10.03-3.38,12",
    "M43.58,18.04c11.79-1.73,28.79-3.79,41.2-4.54c6.23-0.38,4.22,4-0.93,7.98",
    "M48.43,28.32c1.57,0.3,3.95,0.14,5.71-0.06c6.53-0.76,13.77-1.78,20.74-2.4c1.77-0.16,3.6-0.19,5.35,0.22",
    "M46.08,37.83c0.92,0.92,1.2,2.01,1.29,2.58c0.61,3.57,1.83,10.77,2.87,18.06c0.17,1.16,0.32,2.3,0.46,3.38",
    "M48.51,39.06c8.85-1.1,26.09-3.65,30.95-4.1c2.3-0.21,3.8,0.79,3.63,3.43c-0.25,3.83-1.92,11.09-3.23,17.83c-0.22,1.12-0.45,2.21-0.71,3.26",
    "M50.25,49.24c7.38-0.99,21.5-3.24,30.52-3.73",
    "M51.5,59.56c7.02-0.86,18.75-2.19,26.89-2.69",
    "M40.29,70.38c2.96,0.75,5.35,0.67,7.96,0.43c10.72-0.99,24.7-2.28,34.88-2.85c2.7-0.15,5.19-0.09,7.84,0.46",
    "M62.61,18.04c0.99,0.99,1.64,2.21,1.64,3.62c0,0.88-0.02,42.01-0.11,58.34c-0.02,2.91-0.03,5.03-0.05,6",
    "M18.75,20c3.35,1.61,8.66,6.63,9.5,9.13",
    "M13.25,50.5C15.5,51.5,17,51,18,50.75S27.25,47.5,28.75,47c3.25-1.08,3.59,1.06,1.44,4.1C23,61.25,23.25,61,30.72,67.27c2.88,2.42,2.8,3.84,0.53,5.73c-1.5,1.25-9.25,8-10.75,8.5",
    "M16.25,83c3-0.5,9-1.75,13.5-0.75s29.32,7.71,33.75,9c12,3.5,21.25,4.5,30.25,2.75",
];

export default function KanjiAnimation({ className = "", size = 100, duration = 0.5, delayBetween = 0.2, strokeWidth = 4, onAnimationComplete: onKanjiAnimationComplete }: KanjiAnimationProps) {
    const pathRefs = useRef<(SVGPathElement | null)[]>([]);

    useEffect(() => {
        for (const [i, path] of pathRefs.current.entries()) {
            if (!path) continue;

            const length = path.getTotalLength();
            // Set initial state: hide the stroke completely
            path.style.strokeDasharray = length.toString();
            path.style.strokeDashoffset = length.toString();

            const animation = path.animate([{ strokeDashoffset: length.toString() }, { strokeDashoffset: "0" }], {
                duration: duration * 1000,
                easing: "ease-in-out",
                fill: "forwards",
                delay: i * (duration + delayBetween) * 1000,
            });

            if (i === pathRefs.current.length - 1 && onKanjiAnimationComplete) animation.addEventListener("finish", onKanjiAnimationComplete);
        }
    }, [duration, delayBetween]);

    return (
        <div className="flex justify-center items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 109 109" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} role="img" aria-label="Kanji for luck/fate">
                <title>Animated kanji character drawing</title>
                {pathData.map((d, index) => (
                    <path
                        key={index}
                        d={d}
                        style={{ strokeDasharray: "1000", strokeDashoffset: "1000" }}
                        ref={(el) => {
                            pathRefs.current[index] = el;
                        }}
                    />
                ))}
            </svg>
        </div>
    );
}
