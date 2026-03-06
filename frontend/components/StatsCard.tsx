'use client';

import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: LucideIcon;
    color: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
}

export default function StatsCard({ title, value, subtitle, icon: Icon, color, trend }: StatsCardProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 transition-all hover:shadow-xl">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</h3>
                    {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
                </div>
                <div className={`${color} p-3 rounded-xl text-white`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>

            {trend && (
                <div className="mt-4 flex items-center gap-2">
                    <span className={`text-sm font-semibold ${trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {trend.isPositive ? '+' : ''}{trend.value}%
                    </span>
                    <span className="text-xs text-gray-400">vs last period</span>
                </div>
            )}
        </div>
    );
}
