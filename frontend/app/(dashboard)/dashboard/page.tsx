'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PageContainer } from '@/components/layout/PageContainer';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';
import { AbilityMeter } from '@/components/dashboard/AbilityMeter';
import { Heatmap } from '@/components/dashboard/Heatmap';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import TimetableWidget from '@/components/dashboard/TimetableWidget';
import { Play, TrendingUp, Target, Clock, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import analyticsService, { PerformanceStats, TopicGrowth } from '@/services/analyticsService';
import testService, { Test } from '@/services/testService';

import { useRouter } from 'next/navigation';

export default function Dashboard() {
    const { user } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<PerformanceStats | null>(null);
    const [topicData, setTopicData] = useState<TopicGrowth | null>(null);
    const [testHistory, setTestHistory] = useState<Test[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setIsLoading(true);
                const [performanceRes, growthRes, historyRes] = await Promise.all([
                    analyticsService.getPerformanceStats(),
                    analyticsService.getTopicGrowth(),
                    testService.getTestHistory(20)
                ]);
                setStats(performanceRes.data);
                setTopicData(growthRes.data);
                setTestHistory(historyRes.data.tests);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const handleTopicClick = (subject: string, topic: string) => {
        router.push(`/test?subject=${encodeURIComponent(subject)}&chapter=${encodeURIComponent(topic)}`);
    };

    const handleTestClick = (testId: string, status: string) => {
        if (status === 'active') {
            router.push(`/test/${testId}`);
        } else {
            router.push(`/test/result/${testId}`);
        }
    };

    // Container animation variants
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <PageContainer>
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="space-y-8"
            >
                {/* Header Section */}
                <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-tight">
                            Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">{user?.name?.split(' ')[0] || 'Student'}</span>
                        </h1>
                        <p className="text-slate-400 text-lg">Here&apos;s your learning summary for today.</p>
                    </div>
                    <Link href="/test">
                        <Button size="lg" variant="gradient" className="shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] transition-all" rightIcon={<Play className="w-4 h-4" />}>
                            Start New Test
                        </Button>
                    </Link>
                </motion.div>

                {/* Stats Grid */}
                <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Tests Taken"
                        value={isLoading ? "..." : (stats?.tests.total || 0).toString()}
                        icon={Target}
                        color="indigo"
                        description="Total completed sessions"
                    />
                    <StatCard
                        title="Avg Accuracy"
                        value={isLoading ? "..." : `${Math.round(stats?.tests.average_accuracy || 0)}%`}
                        icon={TrendingUp}
                        color="emerald"
                        trend={stats?.tests.average_accuracy ? { value: 0, label: "Your baseline", positive: true } : undefined}
                    />
                    <StatCard
                        title="Questions Solved"
                        value={isLoading ? "..." : (stats?.tests.total_questions || 0).toString()}
                        icon={Clock}
                        color="blue"
                        description="Keep it up!"
                    />
                    <StatCard
                        title="Weak Chapters"
                        value={isLoading ? "..." : (stats?.topics.weak || 0).toString()}
                        icon={AlertTriangle}
                        color="rose"
                        description="Focus on these"
                    />
                </motion.div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column (2/3) */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Ability & Heatmap Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <motion.div variants={item} className="h-[400px]">
                                <AbilityMeter score={stats?.user.ability_score || 0.3} loading={isLoading} />
                            </motion.div>
                            <motion.div variants={item} className="h-[400px]">
                                <Heatmap
                                    topics={topicData?.topics}
                                    loading={isLoading}
                                    onTopicClick={handleTopicClick}
                                />
                            </motion.div>
                        </div>

                        {/* Timetable Row */}
                        <motion.div variants={item}>
                            <TimetableWidget />
                        </motion.div>
                    </div>

                    {/* Right Column (1/3) */}
                    <motion.div variants={item} className="lg:col-span-1 h-full">
                        <RecentActivity
                            tests={testHistory}
                            loading={isLoading}
                            onTestClick={handleTestClick}
                        />
                    </motion.div>
                </div>
            </motion.div>
        </PageContainer>
    );
}
