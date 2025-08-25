import type React from "react";

interface ShinyTextProps {
    text: string;
    disabled?: boolean;
    speed?: number;
    className?: string;
}

const ShinyText: React.FC<ShinyTextProps> = ({ text, disabled = false, speed = 5, className = "" }) => {
    const animationDuration = `${speed}s`;

    return (
        <div
            className={`text-[rgba(255,255,255,0.65)] bg-clip-text inline-block hover:text-white transition-all duration-250 ease-in-out ${disabled ? "" : "animate-shine"} ${className}`}
            style={{
                backgroundImage: "linear-gradient(120deg, rgba(255, 255, 255, 0) 40%, var(--primary) 50%, rgba(255, 255, 255, 0) 60%)",
                backgroundSize: "200% 100%",
                WebkitBackgroundClip: "text",
                animationDuration: animationDuration,
            }}
        >
            {text}
        </div>
    );
};

export default ShinyText;
