import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: number;
        label: string;
        positive?: boolean;
    };
    description?: string;
    color?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'blue' | 'purple';
    className?: string;
}

const StatCard = ({ title, value, icon: Icon, trend, description, color = 'indigo', className }: StatCardProps) => {

    const colors = {
        indigo: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]",
        emerald: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]",
        amber: "bg-amber-500/20 text-amber-300 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]",
        rose: "bg-rose-500/20 text-rose-300 border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.2)]",
        blue: "bg-blue-500/20 text-blue-300 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]",
        purple: "bg-purple-500/20 text-purple-300 border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]",
    };

    return (
        <Card className={cn("p-6", className)} hover>
            <div className="flex items-start justify-between mb-4">
                <div className={cn("p-3 rounded-xl border", colors[color])}>
                    <Icon className="w-5 h-5" />
                </div>
                {trend && (
                    <Badge variant={trend.positive ? 'success' : 'danger'}>
                        {trend.positive ? '+' : ''}{trend.value}% {trend.label}
                    </Badge>
                )}
            </div>

            <div className="space-y-1">
                <h3 className="text-sm font-medium text-slate-400">{title}</h3>
                <div className="text-2xl font-bold text-white">
                    {typeof value === 'number' ? (
                        <AnimatedCounter value={value} />
                    ) : value}
                </div>
                {description && (
                    <p className="text-xs text-slate-500 mt-1">{description}</p>
                )}
            </div>
        </Card>
    );
};

export { StatCard };
