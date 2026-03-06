'use client';

interface ProgressBarProps {
    current: number;
    total: number;
    correct: number;
}

export default function ProgressBar({ current, total, correct }: ProgressBarProps) {
    const percentage = (current / total) * 100;
    const accuracy = current > 0 ? (correct / current) * 100 : 0;

    return (
        <div className="w-full space-y-2">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Question {current} of {total}</span>
                <span>Accuracy: {accuracy.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300 ease-out"
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500">
                <span>{correct} correct</span>
                <span>{current - correct} incorrect</span>
            </div>
        </div>
    );
}
