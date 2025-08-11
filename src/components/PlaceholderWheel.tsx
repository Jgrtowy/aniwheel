"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "~/lib/utils";

export default function PlaceholderWheel({ className }: { className?: string }) {
    const [rotation, setRotation] = useState(0);
    const [isSpinning, setIsSpinning] = useState(false);
    const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

    const spinWheel = () => {
        if (timeoutId) clearTimeout(timeoutId);

        setIsSpinning(true);

        const baseRotations = 3 + Math.random() * 3;
        const finalPosition = Math.random() * 360;
        const totalRotation = rotation + baseRotations * 360 + finalPosition;

        setRotation(totalRotation);

        const newTimeoutId = setTimeout(() => {
            setIsSpinning(false);
            setTimeoutId(null);
        }, 3000);

        setTimeoutId(newTimeoutId);
    };

    useEffect(() => {
        const awaitSpin = async () => {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            spinWheel();
        };
        awaitSpin();
    }, []);

    useEffect(() => {
        return () => {
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [timeoutId]);

    return (
        <div className={cn("relative", className)} onClick={spinWheel}>
            <img src="/Click_to_spin.svg" alt="Click to spin!" className={cn("absolute inset-0 object-cover z-10 rounded-full opacity-100 pointer-events-none transition-opacity", isSpinning && "opacity-0")} />
            <svg viewBox="0 0 302 302" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" className="absolute inset-0 cursor-pointer origin-center" style={{ transform: `rotate(${rotation}deg)`, transition: isSpinning ? "transform 3s cubic-bezier(0.23, 1, 0.32, 1)" : "none" }}>
                <title>Placeholder wheel</title>
                <path d="M151 151H301C301 177.33 294.069 203.197 280.904 226L151 151Z" fill="#4A90E2" stroke="white" strokeWidth="2" />
                <path d="M151 151L280.904 226C267.739 248.803 248.803 267.739 226 280.904L151 151Z" fill="#D64550" stroke="white" strokeWidth="2" />
                <path d="M151 151L226 280.904C203.197 294.069 177.33 301 151 301V151Z" fill="#F9C80E" stroke="white" strokeWidth="2" />
                <path d="M151 151V301C124.67 301 98.8029 294.069 76 280.904L151 151Z" fill="#6F4A8E" stroke="white" strokeWidth="2" />
                <path d="M151 151L76 280.904C53.1971 267.739 34.2614 248.803 21.0962 226L151 151Z" fill="#FF6F61" stroke="white" strokeWidth="2" />
                <path d="M151 151L21.0962 226C7.93094 203.197 1 177.33 1 151H151Z" fill="#00A8E8" stroke="white" strokeWidth="2" />
                <path d="M151 151H1C1 124.67 7.93094 98.8029 21.0962 76L151 151Z" fill="#9A348E" stroke="white" strokeWidth="2" />
                <path d="M151 151L21.0962 76C34.2614 53.1971 53.1971 34.2614 76 21.0962L151 151Z" fill="#2A9D8F" stroke="white" strokeWidth="2" />
                <path d="M151 151L76 21.0962C98.8029 7.93094 124.67 1 151 1V151Z" fill="#F4A261" stroke="white" strokeWidth="2" />
                <path d="M151 151V1C177.33 1 203.197 7.93094 226 21.0962L151 151Z" fill="#E94E77" stroke="white" strokeWidth="2" />
                <path d="M151 151L226 21.0962C248.803 34.2614 267.739 53.1971 280.904 76L151 151Z" fill="#F6AE2D" stroke="white" strokeWidth="2" />
                <path d="M151 151L280.904 76C294.069 98.8029 301 124.67 301 151H151Z" fill="#6AB187" stroke="white" strokeWidth="2" />
            </svg>
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-3">
                <ChevronDown className="w-8 h-8 text-white absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white border-4 border-gray-300 rounded-full" />
        </div>
    );
}
