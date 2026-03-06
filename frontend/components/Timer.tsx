'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

import { cn } from '@/lib/utils';

interface TimerProps {
    onTimeUpdate?: (seconds: number) => void;
    autoStart?: boolean;
    className?: string;
}

export default function Timer({ onTimeUpdate, autoStart = true, className }: TimerProps) {
    const [seconds, setSeconds] = useState(0);
    const [isRunning, setIsRunning] = useState(autoStart);

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        if (isRunning) {
            interval = setInterval(() => {
                setSeconds((prev) => {
                    const newSeconds = prev + 1;
                    if (onTimeUpdate) {
                        onTimeUpdate(newSeconds);
                    }
                    return newSeconds;
                });
            }, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isRunning, onTimeUpdate]);

    const formatTime = (totalSeconds: number) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className={cn("flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors", className)}>
            <Clock className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            <span className="font-mono text-lg font-semibold text-slate-900 dark:text-white">
                {formatTime(seconds)}
            </span>
        </div>
    );
}
