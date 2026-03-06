import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
    value: number;
    max?: number;
    showLabel?: boolean;
    label?: string;
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'gradient';
    className?: string;
    height?: string;
}

const ProgressBar = ({
    value,
    max = 100,
    showLabel = false,
    label,
    variant = 'default',
    className,
    height = "h-2"
}: ProgressBarProps) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    const variants = {
        default: "bg-indigo-500",
        success: "bg-emerald-500",
        warning: "bg-amber-500",
        danger: "bg-rose-500",
        gradient: "bg-gradient-to-r from-indigo-500 to-purple-500",
    };

    return (
        <div className={cn("w-full", className)}>
            {showLabel && (
                <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-400 font-medium">{label}</span>
                    <span className="text-slate-200 font-bold">{Math.round(percentage)}%</span>
                </div>
            )}
            <div className={cn("w-full bg-slate-800 rounded-full overflow-hidden", height)}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={cn("h-full rounded-full", variants[variant])}
                />
            </div>
        </div>
    );
};

export { ProgressBar };
