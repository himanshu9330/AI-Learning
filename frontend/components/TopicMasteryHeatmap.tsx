'use client';

import { useState, useEffect } from 'react';
import analyticsService from '@/services/analyticsService';

interface TopicData {
    topic: string;
    mastery_score: number;
    attempts: number;
    classification: 'weak' | 'moderate' | 'strong';
}

export default function TopicMasteryHeatmap() {
    const [topics, setTopics] = useState<TopicData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTopics = async () => {
            try {
                const response = await analyticsService.getTopicGrowth();
                setTopics(response.data.topics);
            } catch (error) {
                console.error('Failed to fetch topics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTopics();
    }, []);

    const getBgColor = (score: number) => {
        if (score < 0.3) return 'bg-red-500';
        if (score < 0.6) return 'bg-orange-500';
        if (score < 0.8) return 'bg-blue-500';
        return 'bg-green-500';
    };

    const getOpacity = (attempts: number) => {
        if (attempts === 0) return 'opacity-20';
        if (attempts < 5) return 'opacity-60';
        if (attempts < 15) return 'opacity-80';
        return 'opacity-100';
    };

    if (loading) {
        return <div className="animate-pulse flex items-center justify-center h-48 bg-gray-100 dark:bg-gray-800 rounded-xl">Loading topics...</div>;
    }

    if (topics.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-48 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                <p className="text-gray-500 dark:text-gray-400">No topic data yet.</p>
                <p className="text-xs text-gray-400">Take a test to see your mastery levels.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {topics.map((topic, index) => (
                <div
                    key={index}
                    className="relative group p-4 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all cursor-pointer overflow-hidden"
                >
                    <div className={`absolute top-0 right-0 w-2 h-full ${getBgColor(topic.mastery_score)} ${getOpacity(topic.attempts)}`} />
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate pr-4">{topic.topic}</h4>
                    <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-400">{topic.attempts} attempts</span>
                        <span className="text-lg font-black text-gray-900 dark:text-white">{(topic.mastery_score * 100).toFixed(0)}%</span>
                    </div>
                    {/* Tooltip on hover */}
                    <div className="absolute inset-0 bg-indigo-600 text-white p-4 text-xs flex flex-col justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="font-bold mb-1">{topic.topic}</p>
                        <p>Mastery: {(topic.mastery_score * 100).toFixed(1)}%</p>
                        <p>Attempts: {topic.attempts}</p>
                        <p>Level: {topic.classification}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
