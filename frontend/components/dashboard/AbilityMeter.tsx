'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Card } from '@/components/ui/Card';

interface AbilityMeterProps {
    score: number; // 0 to 1
    loading?: boolean;
}

const AbilityMeter = ({ score, loading }: AbilityMeterProps) => {
    const percentage = Math.round(score * 100);

    // Determine level and color
    let level = "Novice";
    let color = "#6366f1"; // Indigo
    let text = "Keep practicing to establish your baseline.";

    if (percentage >= 80) {
        level = "Expert";
        color = "#10b981"; // Emerald
        text = "You're crushing it! Maintain your streak.";
    } else if (percentage >= 60) {
        level = "Advanced";
        color = "#3b82f6"; // Blue
        text = "Great progress. Push for mastery.";
    } else if (percentage >= 40) {
        level = "Intermediate";
        color = "#f59e0b"; // Amber
        text = "You're getting there. Focus on weak spots.";
    }

    return (
        <Card className="p-6 flex flex-col items-center justify-center text-center h-full relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />

            <h3 className="text-lg font-semibold text-white mb-6">Ability Score</h3>

            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="w-48 h-48 relative mb-6"
            >
                <CircularProgressbar
                    value={loading ? 0 : percentage}
                    text={`${percentage}`}
                    styles={buildStyles({
                        textSize: '24px',
                        pathColor: color,
                        textColor: '#fff',
                        trailColor: '#1e293b',
                        pathTransitionDuration: 1.5,
                    })}
                />

                {/* Glow behind */}
                <div
                    className="absolute inset-0 rounded-full blur-3xl opacity-40 -z-10 transition-opacity duration-700"
                    style={{ backgroundColor: color }}
                />
            </motion.div>

            <div className="space-y-2 relative z-10 w-full">
                <div
                    className="inline-block px-3 py-1 rounded-full text-sm font-bold border"
                    style={{
                        backgroundColor: `${color}15`,
                        color: color,
                        borderColor: `${color}30`
                    }}
                >
                    {level} Level
                </div>
                <p className="text-sm text-slate-400 max-w-[200px] mx-auto">
                    {text}
                </p>
            </div>
        </Card>
    );
};

export { AbilityMeter };
