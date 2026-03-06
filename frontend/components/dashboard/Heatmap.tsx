'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { motion } from 'framer-motion';

interface TopicData {
    topic: string;
    subject: string;
    mastery_score: number;
    classification: 'weak' | 'moderate' | 'strong';
}

interface HeatmapProps {
    topics?: TopicData[];
    loading?: boolean;
    onTopicClick?: (subject: string, chapter: string) => void;
}

const Heatmap = ({ topics = [], loading, onTopicClick }: HeatmapProps) => {
    // Default colors for classifications
    const colorMap = {
        weak: 'bg-rose-500',
        moderate: 'bg-amber-500',
        strong: 'bg-emerald-500'
    };

    return (
        <Card className="p-6 h-full relative overflow-hidden flex flex-col">
            <h3 className="text-xl font-bold text-white mb-6">Topic Mastery</h3>

            {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 animate-pulse">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="aspect-square rounded-2xl bg-slate-800/50" />
                    ))}
                </div>
            ) : topics.length > 0 ? (
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {topics.map((topic, index) => (
                            <motion.div
                                key={`${topic.subject}-${topic.topic}`}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: Math.min(index * 0.05, 0.5) }} // Cap delay for large lists
                                onClick={() => onTopicClick?.(topic.subject, topic.topic)}
                                className="group relative aspect-square rounded-2xl bg-slate-800/40 border border-slate-700/50 overflow-hidden hover:border-slate-500 hover:shadow-lg transition-all cursor-pointer backdrop-blur-md"
                            >
                                <div
                                    className={`absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity ${colorMap[topic.classification] || 'bg-blue-500'}`}
                                />
                                <div className="absolute inset-0 p-3 flex flex-col justify-between z-10">
                                    <span className="text-xs font-semibold text-slate-200 line-clamp-2 leading-tight" title={topic.topic}>{topic.topic}</span>
                                    <div className="flex items-end justify-between mt-1">
                                        <div className="w-10 h-1.5 rounded-full bg-slate-900/50 overflow-hidden mb-1">
                                            <div className="h-full bg-white/70 rounded-full" style={{ width: `${Math.round(topic.mastery_score * 100)}%` }} />
                                        </div>
                                        <span className="text-sm font-black text-white">{Math.round(topic.mastery_score * 100)}%</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="h-[200px] flex flex-col items-center justify-center text-center space-y-2">
                    <div className="w-14 h-14 rounded-full bg-slate-800/80 flex items-center justify-center shadow-lg">
                        <span className="text-2xl">📊</span>
                    </div>
                    <p className="text-sm text-slate-400 max-w-[200px]">No topic data available yet. Take a test to start tracking your mastery!</p>
                </div>
            )}

            <div className="mt-4 flex justify-between text-[10px] text-slate-500 px-1">
                <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Weak</div>
                <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Avg</div>
                <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> High</div>
            </div>
        </Card>
    );
};

export { Heatmap };
