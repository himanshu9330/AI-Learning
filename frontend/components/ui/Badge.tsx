import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
    icon?: React.ReactNode;
}

const Badge = ({ className, variant = 'default', icon, children, ...props }: BadgeProps) => {
    const variants = {
        default: "bg-slate-800 text-slate-300 border-slate-700",
        success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        danger: "bg-rose-500/10 text-rose-400 border-rose-500/20",
        info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    };

    return (
        <div
            className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                variants[variant],
                className
            )}
            {...props}
        >
            {icon && <span className="mr-1.5 -ml-0.5">{icon}</span>}
            {children}
        </div>
    );
};

export { Badge };
