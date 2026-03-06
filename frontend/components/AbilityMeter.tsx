'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface AbilityMeterProps {
    score: number; // 0-1
    previousScore?: number;
    showChange?: boolean;
}

export default function AbilityMeter({ score, previousScore, showChange = false }: AbilityMeterProps) {
    const percentage = score * 100;
    const change = previousScore !== undefined ? score - previousScore : 0;

    const getAbilityLevel = (score: number) => {
        if (score < 0.3) return { label: 'Beginner', color: 'text-red-600 dark:text-red-400' };
        if (score < 0.6) return { label: 'Intermediate', color: 'text-orange-600 dark:text-orange-400' };
        if (score < 0.8) return { label: 'Advanced', color: 'text-blue-600 dark:text-blue-400' };
        return { label: 'Expert', color: 'text-green-600 dark:text-green-400' };
    };

    const getColorClass = (score: number) => {
        if (score < 0.3) return 'from-red-500 to-red-600';
        if (score < 0.6) return 'from-orange-500 to-orange-600';
        if (score < 0.8) return 'from-blue-500 to-blue-600';
        return 'from-green-500 to-green-600';
    };

    const level = getAbilityLevel(score);

    return (
        <div className="w-full space-y-3">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Ability Score</h3>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-gray-900 dark:text-white">
                            {percentage.toFixed(1)}%
                        </span>
                        <span className={`text-sm font-semibold ${level.color}`}>
                            {level.label}
                        </span>
                    </div>
                </div>

                {showChange && change !== 0 && (
                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${change > 0 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}>
                        {change > 0 ? (
                            <TrendingUp className="w-4 h-4" />
                        ) : change < 0 ? (
                            <TrendingDown className="w-4 h-4" />
                        ) : (
                            <Minus className="w-4 h-4" />
                        )}
                        <span className="text-sm font-semibold">
                            {change > 0 ? '+' : ''}{(change * 100).toFixed(1)}%
                        </span>
                    </div>
                )}
            </div>

            {/* Progress Bar */}
            <div className="relative w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                    className={`h-full bg-gradient-to-r ${getColorClass(score)} transition-all duration-500 ease-out`}
                    style={{ width: `${percentage}%` }}
                />
            </div>

            {/* Scale Markers */}
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
            </div>
        </div>
    );
}
