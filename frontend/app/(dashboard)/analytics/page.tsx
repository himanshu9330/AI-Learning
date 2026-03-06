'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
    PieChart,
    Pie
} from 'recharts';
import {
    TrendingUp,
    Target,
    Zap,
    Clock,
    ArrowLeft,
    Download,
    Calendar,
    Activity
} from 'lucide-react';
import { motion } from 'framer-motion';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';
import analyticsService, { AbilityHistory, TopicGrowth } from '@/services/analyticsService';
import toast, { Toaster } from 'react-hot-toast';

export default function AnalyticsPage() {
    const router = useRouter();
    const [abilityHistory, setAbilityHistory] = useState<AbilityHistory[]>([]);
    const [topicGrowth, setTopicGrowth] = useState<TopicGrowth | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [abilityRes, growthRes] = await Promise.all([
                    analyticsService.getAbilityHistory(),
                    analyticsService.getTopicGrowth()
                ]);
                setAbilityHistory(abilityRes.data.history);
                setTopicGrowth(growthRes.data);
            } catch (error) {
                console.error('Failed to fetch analytics:', error);
                toast.error('Could not load analytics data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <PageContainer>
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="space-y-8"
            >
                {/* Header */}
                <motion.div variants={item} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Performance Analytics</h1>
                        <p className="text-slate-400">Deep dive into your learning metrics and growth.</p>
                    </div>
                    <Button
                        variant="secondary"
                        leftIcon={<Download className="w-4 h-4" />}
                    >
                        Export Report
                    </Button>
                </motion.div>

                {/* Key Insights Grid */}
                <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Current Ability"
                        value={abilityHistory.length > 0
                            ? `${(abilityHistory[abilityHistory.length - 1].ability_score * 100).toFixed(0)}%`
                            : '0%'}
                        icon={Zap}
                        color="indigo"
                        trend={abilityHistory.length > 1 ? { value: 12, label: "this month", positive: true } : undefined}
                    />
                    <StatCard
                        title="Tests Completed"
                        value={abilityHistory.length}
                        icon={Target}
                        color="emerald"
                    />
                    <StatCard
                        title="Study Streak"
                        value="5 Days"
                        icon={Calendar}
                        color="amber"
                        description="Keep it up!"
                    />
                    <StatCard
                        title="Avg. Time/Test"
                        value="18m"
                        icon={Clock}
                        color="blue"
                    />
                </motion.div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Ability Score Growth (Area Chart) */}
                    <motion.div variants={item}>
                        <Card className="p-6 h-[400px] flex flex-col">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                                        <TrendingUp className="w-5 h-5" />
                                    </div>
                                    Ability Trajectory
                                </h3>
                            </div>
                            <div className="flex-1 w-full min-h-0">
                                {abilityHistory.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={abilityHistory}>
                                            <defs>
                                                <linearGradient id="colorAbility" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                                            <XAxis
                                                dataKey="date"
                                                tickFormatter={(val) => new Date(val).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                stroke="#64748b"
                                                fontSize={12}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <YAxis stroke="#64748b" fontSize={12} domain={[0, 1]} tickLine={false} axisLine={false} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', color: '#fff' }}
                                                labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                                                formatter={(value: any) => [`${(value * 100).toFixed(0)}%`, 'Ability Score']}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="ability_score"
                                                stroke="#6366f1"
                                                strokeWidth={3}
                                                fillOpacity={1}
                                                fill="url(#colorAbility)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-3">
                                        <TrendingUp className="w-12 h-12 opacity-10" />
                                        <p className="text-sm">Complete your first test to see your trajectory.</p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </motion.div>

                    {/* Topic Mastery breakdown (Bar Chart) */}
                    <motion.div variants={item}>
                        <Card className="p-6 h-[400px] flex flex-col">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                                        <Activity className="w-5 h-5" />
                                    </div>
                                    Topic Mastery
                                </h3>
                            </div>
                            <div className="flex-1 w-full min-h-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={topicGrowth?.topics || []} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#1e293b" />
                                        <XAxis type="number" domain={[0, 1]} hide />
                                        <YAxis
                                            dataKey="topic"
                                            type="category"
                                            stroke="#94a3b8"
                                            fontSize={12}
                                            width={100}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <Tooltip
                                            cursor={{ fill: '#1e293b' }}
                                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', color: '#fff' }}
                                            formatter={(val: any) => [`${(Number(val) * 100).toFixed(0)}%`, 'Mastery']}
                                        />
                                        <Bar dataKey="mastery_score" radius={[0, 4, 4, 0]} barSize={20}>
                                            {(topicGrowth?.topics || []).map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </motion.div>
                </div>
            </motion.div>
        </PageContainer>
    );
}
