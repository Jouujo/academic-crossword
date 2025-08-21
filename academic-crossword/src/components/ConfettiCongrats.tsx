"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import react-confetti to avoid SSR issues
const ReactConfetti = dynamic(() => import("react-confetti"), {
    ssr: false,
    loading: () => null,
});

export default function ConfettiCongrats({ 
    show = true, 
    completionTime 
}: { 
    show?: boolean;
    completionTime?: number;
}) {
    const [mounted, setMounted] = useState(false);
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

    useEffect(() => {
        setMounted(true);
        
        // Set dimensions when component mounts
        const updateDimensions = () => {
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };
        
        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    if (!mounted || !show) return null;

    // Format time helper
    const formatTime = (milliseconds: number) => {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const tenths = Math.floor((milliseconds % 1000) / 100);
        
        if (minutes > 0) {
            return `${minutes}:${seconds.toString().padStart(2, '0')}.${tenths}`;
        }
        return `${seconds}.${tenths}`;
    };

    return (
        <div className="fixed inset-0 pointer-events-none z-50">
            <ReactConfetti 
                width={dimensions.width} 
                height={dimensions.height} 
                numberOfPieces={280} 
                recycle={false}
                colors={['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD']}
            />
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/90 backdrop-blur-sm rounded-xl px-8 py-4 text-xl font-bold shadow-lg border border-gray-200 text-center">
                    <div>🎉 Congratulations! You solved the crossword puzzle! 🎉</div>
                    {completionTime && (
                        <div className="mt-2 text-lg text-blue-600 font-mono">
                            Completion Time: {formatTime(completionTime)}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}


