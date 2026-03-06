'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    Calendar, Clock, BookOpen, CheckCircle2, ChevronRight,
    Target, Sparkles, Map, Brain, TrendingUp, RefreshCw,
    AlertTriangle, Lock, Star, Zap, RotateCcw, ArrowRight,
    Trophy, Flame, BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import roadmapService, { WeeklyRoadmap } from '@/services/roadmapService';
import apiClient from '@/lib/apiClient';
import toast, { Toaster } from 'react-hot-toast';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────
interface Chapter {
    subject: string;
    chapter: string;
    status: 'not_started' | 'in_progress' | 'mastered' | 'weak';
    mastery: number;
    prerequisites: string[];
}

interface Revision {
    chapter: string;
    subject: string;
    next_revision_date: string;
    interval_days: number;
}

// ─── Helpers ───────────────────────────────────────────────────────────
const STATUS_CONFIG = {
    mastered: { color: 'bg-emerald-500', border: 'border-emerald-500', text: 'text-emerald-400', label: 'Mastered', icon: <Trophy className="w-3 h-3" /> },
    in_progress: { color: 'bg-blue-500', border: 'border-blue-500', text: 'text-blue-400', label: 'In Progress', icon: <Flame className="w-3 h-3" /> },
    weak: { color: 'bg-rose-500', border: 'border-rose-500', text: 'text-rose-400', label: 'Needs Work', icon: <AlertTriangle className="w-3 h-3" /> },
    not_started: { color: 'bg-slate-600', border: 'border-slate-700', text: 'text-slate-500', label: 'Not Started', icon: <Lock className="w-3 h-3" /> },
};

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function CircularProgress({ value, size = 56 }: { value: number; size?: number }) {
    const r = (size - 8) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (value / 100) * circ;
    const color = value >= 75 ? '#10b981' : value >= 40 ? '#3b82f6' : value > 0 ? '#f43f5e' : '#475569';
    return (
        <svg width={size} height={size} className="rotate-[-90deg]">
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1e293b" strokeWidth={6} />
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={6}
                strokeDasharray={circ} strokeDashoffset={offset}
                strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
        </svg>
    );
}

// ─── Main Component ────────────────────────────────────────────────────
export default function RoadmapPage() {
    const router = useRouter();
    const [tab, setTab] = useState<'skillmap' | 'weekplan' | 'countdown'>('skillmap');
    const [roadmap, setRoadmap] = useState<WeeklyRoadmap | null>(null);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [revisions, setRevisions] = useState<Revision[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDayIndex, setSelectedDayIndex] = useState(0);
    const [examDate, setExamDate] = useState<string>('');
    const [selectedSubject, setSelectedSubject] = useState<string>('All');
    const [rebalanced, setRebalanced] = useState(false);

    // Fetch all data in parallel
    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const [roadmapRes, chaptersRes, revisionsRes] = await Promise.allSettled([
                roadmapService.getLatestRoadmap(),
                apiClient.get('/roadmap/chapters'),
                apiClient.get('/roadmap/revisions'),
            ]);

            if (roadmapRes.status === 'fulfilled') {
                setRoadmap(roadmapRes.value.data);
                const today = new Date().toLocaleDateString([], { weekday: 'long' });
                const idx = roadmapRes.value.data.week_plan?.findIndex((d: any) => d.day === today);
                setSelectedDayIndex(idx !== -1 && idx !== undefined ? idx : 0);

                // Check for overdue tasks → rebalance
                const overdue = roadmapRes.value.data.week_plan?.some((day: any) => {
                    if (!day.date) return false;
                    return new Date(day.date) < new Date() && day.tasks?.some((t: any) => !t.completed);
                });
                if (overdue) setRebalanced(true);
            }

            if (chaptersRes.status === 'fulfilled') {
                setChapters(chaptersRes.value.data.data.chapters || []);
            }

            if (revisionsRes.status === 'fulfilled') {
                setRevisions(revisionsRes.value.data.data.revisions || []);
            }
        } catch (err) {
            console.error('Failed to load roadmap data');
        } finally {
            setLoading(false);
        }

        // Load exam date from localStorage
        const stored = localStorage.getItem('exam_date');
        if (stored) setExamDate(stored);
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const handleToggleTask = async (taskId: string, currentStatus: boolean) => {
        try {
            const response = await roadmapService.updateTaskStatus(taskId, !currentStatus);
            if (response.status === 'success') {
                setRoadmap(prev => {
                    if (!prev) return null;
                    return {
                        ...prev,
                        week_plan: prev.week_plan.map(day => ({
                            ...day,
                            tasks: day.tasks.map(task =>
                                task._id === taskId ? { ...task, completed: !currentStatus } : task
                            )
                        }))
                    };
                });
                toast.success(!currentStatus ? '✅ Task completed!' : 'Task uncompleted');
            }
        } catch {
            toast.error('Failed to update task status');
        }
    };

    const handleExamDateSave = (date: string) => {
        setExamDate(date);
        localStorage.setItem('exam_date', date);
        toast.success('Exam date saved!');
    };

    // Derived
    const subjects = ['All', ...Array.from(new Set(chapters.map(c => c.subject)))];
    const filteredChapters = selectedSubject === 'All' ? chapters : chapters.filter(c => c.subject === selectedSubject);
    const masteredCount = chapters.filter(c => c.status === 'mastered').length;
    const completionPct = chapters.length > 0 ? Math.round((masteredCount / chapters.length) * 100) : 0;

    const daysLeft = examDate ? Math.ceil((new Date(examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;
    const weeksPlan = daysLeft ? Math.floor(daysLeft / 7) : null;
    const requiredPace = chapters.length > 0 && daysLeft ? Math.ceil((chapters.length - masteredCount) / (daysLeft / 7)) : null;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-400 text-sm animate-pulse">Loading your learning roadmap...</p>
                </div>
            </div>
        );
    }

    return (
        <PageContainer>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

                {/* ── HEADER ─────────────────────────────── */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 mb-1">
                            Learning Roadmap
                        </h1>
                        <p className="text-slate-400 text-sm">Your complete AI-powered path to exam mastery</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {rebalanced && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-xs font-medium">
                                <RefreshCw className="w-3 h-3" />
                                Plan auto-rebalanced
                            </div>
                        )}
                        <Badge variant="purple" icon={<Sparkles className="w-3 h-3" />} className="px-3 py-1">
                            AI PERSONALIZED
                        </Badge>
                    </div>
                </div>

                {/* ── STATS ROW ─────────────────────────── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { label: 'Chapters Mastered', value: `${masteredCount}/${chapters.length}`, icon: <Trophy className="w-5 h-5" />, color: 'text-emerald-400 bg-emerald-500/10' },
                        { label: 'Syllabus Completed', value: `${completionPct}%`, icon: <BarChart3 className="w-5 h-5" />, color: 'text-blue-400 bg-blue-500/10' },
                        { label: 'Revisions Due', value: revisions.length, icon: <RotateCcw className="w-5 h-5" />, color: revisions.length > 0 ? 'text-amber-400 bg-amber-500/10' : 'text-slate-400 bg-slate-800' },
                        { label: 'Days to Exam', value: daysLeft !== null ? daysLeft : '—', icon: <Target className="w-5 h-5" />, color: daysLeft !== null && daysLeft < 30 ? 'text-rose-400 bg-rose-500/10' : 'text-purple-400 bg-purple-500/10' },
                    ].map(stat => (
                        <motion.div key={stat.label} whileHover={{ scale: 1.02 }}
                            className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
                            <div className={cn('p-2 rounded-xl', stat.color.split(' ')[1])}>
                                <span className={stat.color.split(' ')[0]}>{stat.icon}</span>
                            </div>
                            <div>
                                <div className="text-xl font-black text-white">{stat.value}</div>
                                <div className="text-xs text-slate-500">{stat.label}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* ── TABS ─────────────────────────────────── */}
                <div className="flex gap-1 bg-slate-900/60 border border-slate-800 rounded-xl p-1 w-fit">
                    {[
                        { key: 'skillmap', label: 'Skill Map', icon: <Map className="w-4 h-4" /> },
                        { key: 'weekplan', label: 'Week Plan', icon: <Calendar className="w-4 h-4" /> },
                        { key: 'countdown', label: 'Exam & Revisions', icon: <Target className="w-4 h-4" /> },
                    ].map(t => (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key as any)}
                            className={cn(
                                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all',
                                tab === t.key
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30'
                                    : 'text-slate-400 hover:text-white'
                            )}
                        >
                            {t.icon}{t.label}
                        </button>
                    ))}
                </div>

                {/* ── TAB CONTENT ──────────────────────────── */}
                <AnimatePresence mode="wait">

                    {/* ── SKILL MAP TAB ── */}
                    {tab === 'skillmap' && (
                        <motion.div key="skillmap"
                            initial={{ opacity: 0, x: -16 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 16 }}
                            className="space-y-4"
                        >
                            {/* Subject Filter */}
                            <div className="flex flex-wrap gap-2">
                                {subjects.map(s => (
                                    <button key={s} onClick={() => setSelectedSubject(s)}
                                        className={cn(
                                            'px-4 py-1.5 rounded-full text-xs font-bold border transition-all',
                                            selectedSubject === s
                                                ? 'bg-indigo-600 border-indigo-500 text-white'
                                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                                        )}>
                                        {s}
                                    </button>
                                ))}
                            </div>

                            {/* Legend */}
                            <div className="flex flex-wrap gap-3 text-xs">
                                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                                    <div key={key} className="flex items-center gap-1.5">
                                        <div className={cn('w-2.5 h-2.5 rounded-full', cfg.color)} />
                                        <span className="text-slate-400">{cfg.label}</span>
                                    </div>
                                ))}
                            </div>

                            {chapters.length === 0 ? (
                                <Card className="p-12 text-center flex flex-col items-center gap-4">
                                    <Map className="w-12 h-12 text-slate-600" />
                                    <h3 className="text-lg font-bold text-white">No Chapter Data Yet</h3>
                                    <p className="text-slate-400 text-sm max-w-xs">Take adaptive tests to start building your chapter progress map.</p>
                                    <Button onClick={() => router.push('/test')} variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                                        Start a Test
                                    </Button>
                                </Card>
                            ) : (
                                // Group chapters by subject
                                Object.entries(
                                    filteredChapters.reduce((acc, c) => {
                                        if (!acc[c.subject]) acc[c.subject] = [];
                                        acc[c.subject].push(c);
                                        return acc;
                                    }, {} as Record<string, Chapter[]>)
                                ).map(([subject, subChapters]) => (
                                    <div key={subject} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                                        <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                                            <Brain className="w-5 h-5 text-indigo-400" />
                                            {subject}
                                            <span className="text-xs font-normal text-slate-500 ml-2">
                                                {subChapters.filter(c => c.status === 'mastered').length}/{subChapters.length} mastered
                                            </span>
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {subChapters.map((chapter, i) => {
                                                const cfg = STATUS_CONFIG[chapter.status];
                                                const prereqsMastered = chapter.prerequisites.every(p =>
                                                    subChapters.find(c => c.chapter === p)?.status === 'mastered'
                                                );
                                                const isLocked = chapter.status === 'not_started' && chapter.prerequisites.length > 0 && !prereqsMastered;
                                                return (
                                                    <motion.div
                                                        key={chapter.chapter}
                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: i * 0.04 }}
                                                        whileHover={{ scale: isLocked ? 1 : 1.02 }}
                                                        className={cn(
                                                            'relative p-4 rounded-xl border-2 transition-all',
                                                            isLocked ? 'opacity-50 cursor-not-allowed border-slate-800 bg-slate-900/30' : `${cfg.border} bg-slate-900/60 cursor-pointer`,
                                                        )}
                                                        onClick={() => !isLocked && router.push(`/test?chapter=${encodeURIComponent(chapter.chapter)}`)}
                                                    >
                                                        <div className="flex items-start justify-between gap-2 mb-3">
                                                            <div className="flex items-center gap-2">
                                                                {isLocked ? <Lock className="w-4 h-4 text-slate-600" /> : (
                                                                    <span className={cfg.text}>{cfg.icon}</span>
                                                                )}
                                                                <h4 className={cn('font-bold text-sm', isLocked ? 'text-slate-600' : 'text-white')}>
                                                                    {chapter.chapter}
                                                                </h4>
                                                            </div>
                                                            {/* Circular mastery */}
                                                            <div className="relative shrink-0">
                                                                <CircularProgress value={chapter.mastery} size={44} />
                                                                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white rotate-90">
                                                                    {chapter.mastery}%
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', cfg.color + '/20', cfg.text)}>
                                                                {cfg.label}
                                                            </span>
                                                            {chapter.prerequisites.length > 0 && (
                                                                <span className="text-[10px] text-slate-600 truncate ml-2">
                                                                    after {chapter.prerequisites[0]}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {!isLocked && chapter.status !== 'mastered' && (
                                                            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <Zap className="w-3 h-3 text-indigo-400" />
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))
                            )}
                        </motion.div>
                    )}

                    {/* ── WEEK PLAN TAB ── */}
                    {tab === 'weekplan' && (
                        <motion.div key="weekplan"
                            initial={{ opacity: 0, x: -16 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 16 }}
                        >
                            {!roadmap ? (
                                <Card className="p-12 text-center flex flex-col items-center gap-4">
                                    <Calendar className="w-12 h-12 text-slate-600" />
                                    <h3 className="text-xl font-bold text-white">No Week Plan Yet</h3>
                                    <p className="text-slate-400 text-sm max-w-sm">Complete an adaptive test to auto-generate your personalized weekly AI study plan.</p>
                                    <Button onClick={() => router.push('/test')} variant="primary" rightIcon={<ChevronRight className="w-4 h-4" />}>
                                        Start a Test
                                    </Button>
                                </Card>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                                    {/* Day Selector */}
                                    <div className="space-y-2">
                                        {roadmap.week_plan.map((day, idx) => {
                                            const isSelected = selectedDayIndex === idx;
                                            const completedTasks = day.tasks?.filter(t => t.completed).length || 0;
                                            const totalTasks = day.tasks?.length || 0;
                                            const dayPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
                                            return (
                                                <button key={day.day} onClick={() => setSelectedDayIndex(idx)}
                                                    className={cn(
                                                        'w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between group',
                                                        isSelected
                                                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/20'
                                                            : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
                                                    )}
                                                >
                                                    <div>
                                                        <div className="font-bold text-sm">{day.day}</div>
                                                        <div className={cn('text-xs', isSelected ? 'text-indigo-200' : 'text-slate-500')}>
                                                            {completedTasks}/{totalTasks} done
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {dayPct === 100 && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                                                        {isSelected && <ChevronRight className="w-4 h-4" />}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Day Tasks */}
                                    <div className="lg:col-span-3">
                                        <Card className="overflow-hidden">
                                            <div className="h-36 bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 p-6 flex flex-col justify-end relative">
                                                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20px 20px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
                                                <div className="relative z-10 flex items-end justify-between">
                                                    <div>
                                                        <p className="text-indigo-300 text-xs font-bold uppercase tracking-widest mb-1">Your Schedule</p>
                                                        <h2 className="text-4xl font-black text-white">{roadmap.week_plan[selectedDayIndex]?.day}</h2>
                                                    </div>
                                                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-3 py-2 rounded-lg border border-white/10">
                                                        <Target className="w-4 h-4 text-emerald-400" />
                                                        <span className="text-sm font-medium text-white">
                                                            {roadmap.week_plan[selectedDayIndex]?.focus_topic || 'Multiple Topics'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-6 space-y-3 bg-slate-950/20">
                                                <AnimatePresence mode="wait">
                                                    <motion.div key={selectedDayIndex}
                                                        initial={{ opacity: 0, x: 16 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: -16 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="space-y-3"
                                                    >
                                                        {roadmap.week_plan[selectedDayIndex]?.tasks?.length === 0 ? (
                                                            <div className="h-40 flex flex-col items-center justify-center text-slate-500">
                                                                <Star className="w-10 h-10 mb-3 opacity-20" />
                                                                <p>Rest day! Recharge for tomorrow.</p>
                                                            </div>
                                                        ) : (
                                                            roadmap.week_plan[selectedDayIndex]?.tasks?.map((task, idx) => (
                                                                <div key={task._id}
                                                                    className={cn(
                                                                        'group flex gap-4 p-4 rounded-xl border transition-all',
                                                                        task.completed
                                                                            ? 'bg-slate-900/20 border-emerald-500/20 opacity-60'
                                                                            : 'border-slate-800 bg-slate-900/50 hover:border-indigo-500/30'
                                                                    )}
                                                                >
                                                                    <button
                                                                        onClick={() => handleToggleTask(task._id, task.completed)}
                                                                        className={cn(
                                                                            'w-8 h-8 rounded-full border flex items-center justify-center font-bold text-sm shrink-0 transition-all',
                                                                            task.completed
                                                                                ? 'bg-emerald-500 border-emerald-400 text-white'
                                                                                : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-indigo-500/50'
                                                                        )}
                                                                    >
                                                                        {task.completed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                                                                    </button>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                                                                            <div className="flex items-center gap-2">
                                                                                <h4 className={cn('font-bold text-sm', task.completed ? 'text-emerald-400 line-through' : 'text-indigo-400')}>
                                                                                    {task.type.replace(/_/g, ' ')}
                                                                                </h4>
                                                                                <Badge variant={task.priority === 'High' ? 'danger' : 'info'} className="text-[10px]">
                                                                                    {task.priority || 'Normal'}
                                                                                </Badge>
                                                                            </div>
                                                                            <div className="flex items-center gap-3 text-xs text-slate-500">
                                                                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{task.duration}</span>
                                                                                {task.question_count && <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{task.question_count} Qs</span>}
                                                                            </div>
                                                                        </div>
                                                                        <h5 className={cn('font-semibold text-sm mb-2', task.completed ? 'text-slate-500' : 'text-white')}>
                                                                            {task.topic}
                                                                        </h5>
                                                                        <p className="text-xs text-slate-400 mb-3">{task.description}</p>
                                                                        <Button size="sm" variant={task.completed ? 'secondary' : 'primary'}
                                                                            onClick={() => router.push(`/test?chapter=${encodeURIComponent(task.topic)}`)}
                                                                            rightIcon={<ChevronRight className="w-3 h-3" />}
                                                                        >
                                                                            {task.completed ? 'Practice Again' : 'Start Session'}
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        )}
                                                    </motion.div>
                                                </AnimatePresence>
                                            </div>
                                        </Card>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* ── EXAM COUNTDOWN + REVISION TAB ── */}
                    {tab === 'countdown' && (
                        <motion.div key="countdown"
                            initial={{ opacity: 0, x: -16 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 16 }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                        >
                            {/* Exam Countdown Card */}
                            <Card className="p-6 space-y-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-purple-500/10 rounded-xl">
                                        <Target className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <h3 className="font-bold text-white text-lg">Exam Countdown</h3>
                                </div>

                                {/* Exam Date Input */}
                                <div>
                                    <label className="block text-sm text-slate-400 mb-2">Your Exam Date</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="date"
                                            value={examDate}
                                            onChange={e => setExamDate(e.target.value)}
                                            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                                        />
                                        <Button size="sm" variant="primary" onClick={() => handleExamDateSave(examDate)}>Save</Button>
                                    </div>
                                </div>

                                {daysLeft !== null ? (
                                    <div className="space-y-4">
                                        {/* Big Countdown */}
                                        <div className={cn(
                                            'text-center p-6 rounded-2xl border',
                                            daysLeft < 14 ? 'bg-rose-500/10 border-rose-500/20' :
                                                daysLeft < 30 ? 'bg-amber-500/10 border-amber-500/20' :
                                                    'bg-indigo-500/10 border-indigo-500/20'
                                        )}>
                                            <div className={cn('text-6xl font-black mb-1',
                                                daysLeft < 14 ? 'text-rose-400' : daysLeft < 30 ? 'text-amber-400' : 'text-indigo-400'
                                            )}>
                                                {daysLeft}
                                            </div>
                                            <p className="text-slate-300 font-medium">days remaining</p>
                                            {weeksPlan && <p className="text-slate-500 text-xs mt-1">≈ {weeksPlan} weeks</p>}
                                        </div>

                                        {/* Pacing bar */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-xs text-slate-400">
                                                <span>Syllabus Progress</span>
                                                <span className="font-bold text-white">{completionPct}%</span>
                                            </div>
                                            <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                                                <motion.div
                                                    className={cn('h-full rounded-full', completionPct >= 75 ? 'bg-emerald-500' : 'bg-indigo-500')}
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${completionPct}%` }}
                                                    transition={{ duration: 0.8 }}
                                                />
                                            </div>
                                            {requiredPace !== null && (
                                                <p className="text-xs text-slate-500">
                                                    Target:{' '}
                                                    <span className="text-amber-400 font-bold">
                                                        {requiredPace} chapter{requiredPace !== 1 ? 's' : ''}/week
                                                    </span>{' '}
                                                    to finish on time
                                                </p>
                                            )}
                                        </div>

                                        {/* Status */}
                                        <div className={cn(
                                            'p-4 rounded-xl flex items-center gap-3',
                                            daysLeft < 14 ? 'bg-rose-500/10 border border-rose-500/20' :
                                                'bg-slate-900 border border-slate-800'
                                        )}>
                                            {daysLeft < 14 ? <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" /> : <TrendingUp className="w-5 h-5 text-emerald-400 shrink-0" />}
                                            <p className="text-sm text-slate-300">
                                                {daysLeft < 14
                                                    ? "⚠️ Exam is very close! Focus only on weak chapters and revision."
                                                    : `You have ${weeksPlan} weeks left. ${requiredPace ? `Complete ${requiredPace} chapters/week to stay on track.` : ''}`
                                                }
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-slate-500">
                                        <Target className="w-10 h-10 opacity-20 mx-auto mb-3" />
                                        <p className="text-sm">Set your exam date above to calculate your countdown and pacing plan.</p>
                                    </div>
                                )}
                            </Card>

                            {/* Revision Cycles Card */}
                            <Card className="p-6 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-amber-500/10 rounded-xl">
                                        <RotateCcw className="w-5 h-5 text-amber-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg">Revision Cycles</h3>
                                        <p className="text-xs text-slate-400">Spaced repetition — due today</p>
                                    </div>
                                    {revisions.length > 0 && (
                                        <span className="ml-auto bg-amber-500 text-amber-950 font-bold text-xs px-2 py-0.5 rounded-full">
                                            {revisions.length} due
                                        </span>
                                    )}
                                </div>

                                {revisions.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-slate-500 gap-3">
                                        <CheckCircle2 className="w-12 h-12 opacity-20" />
                                        <p className="text-sm text-center">No revisions due today! 🎉<br /><span className="text-xs">Great work keeping up with your schedule.</span></p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {revisions.map((rev, i) => (
                                            <motion.div
                                                key={`${rev.chapter}-${i}`}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                className="flex items-center justify-between p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 hover:bg-amber-500/10 transition-colors"
                                            >
                                                <div>
                                                    <p className="font-semibold text-white text-sm">{rev.chapter}</p>
                                                    <p className="text-xs text-amber-400/70">{rev.subject} · Every {rev.interval_days} days</p>
                                                </div>
                                                <Button size="sm" variant="secondary"
                                                    onClick={() => router.push(`/test?chapter=${encodeURIComponent(rev.chapter)}`)}
                                                    rightIcon={<ArrowRight className="w-3 h-3" />}
                                                >
                                                    Revise
                                                </Button>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}

                                <div className="pt-4 border-t border-slate-800">
                                    <p className="text-xs text-slate-500">
                                        💡 Revision cycles are auto-scheduled after completing chapters.
                                        Weak chapters are prioritized with shorter intervals (every 3 days).
                                    </p>
                                </div>
                            </Card>
                        </motion.div>
                    )}

                </AnimatePresence>
            </motion.div>
            <Toaster position="bottom-right" />
        </PageContainer>
    );
}
