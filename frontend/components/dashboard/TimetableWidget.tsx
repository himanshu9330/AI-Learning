'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, BookOpen, Coffee, GraduationCap, Calendar as CalendarIcon, Loader2, RefreshCw } from 'lucide-react';
import apiClient from '@/lib/apiClient';
import Link from 'next/link';

interface TimetableItem {
    start: string;
    end: string;
    task: string;
    type: "study" | "practice" | "test" | "fixed" | "break" | "extra";
    subject?: string;
}

type WeeklySchedule = Record<string, TimetableItem[]>;

export default function TimetableWidget() {
    const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [today, setToday] = useState("");

    const fetchTimetable = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiClient.get('/timetable/current');
            if (response.data.success && response.data.data) {
                setWeeklySchedule(response.data.data);
            } else {
                setWeeklySchedule(null);
            }
        } catch (err: any) {
            console.error('Failed to fetch timetable:', err);
            setError('Failed to load timetable');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        setToday(dayNames[new Date().getDay()]);
        fetchTimetable();
    }, []);

    const schedule = weeklySchedule ? weeklySchedule[today] : null;

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'study': return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
            case 'practice': return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
            case 'test': return 'bg-purple-500/10 border-purple-500/20 text-purple-400';
            case 'break': return 'bg-slate-500/10 border-slate-500/20 text-slate-400';
            default: return 'bg-white/5 border-white/10 text-slate-300';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'study': return <BookOpen className="w-4 h-4 text-blue-400" />;
            case 'practice': return <GraduationCap className="w-4 h-4 text-emerald-400" />;
            case 'test': return <CalendarIcon className="w-4 h-4 text-purple-400" />;
            case 'break': return <Coffee className="w-4 h-4 text-slate-400" />;
            default: return <Clock className="w-4 h-4 text-slate-400" />;
        }
    };

    if (loading) {
        return (
            <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 min-h-[400px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col h-[500px]">
            {/* Dashboard Header */}
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5 text-indigo-400" />
                        Daily Focus
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">{today}'s Strategic Schedule</p>
                </div>
                {weeklySchedule && (
                    <button
                        onClick={fetchTimetable}
                        className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                )}
            </div>

            {error ? (
                <div className="flex-1 flex flex-col items-center justify-center text-red-400 text-center gap-2">
                    <p>{error}</p>
                    <button onClick={fetchTimetable} className="text-sm bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg text-white">
                        Retry
                    </button>
                </div>
            ) : schedule && schedule.length > 0 ? (
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                    {schedule.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`p-4 rounded-xl border flex gap-4 items-center transition-all hover:translate-x-1 ${getTypeColor(item.type)}`}
                        >
                            <div className="w-24 shrink-0 text-xs font-bold text-slate-300">
                                {item.start} — {item.end}
                            </div>

                            <div className="w-px h-8 bg-current opacity-20 rounded-full"></div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    {getTypeIcon(item.type)}
                                    <h3 className="font-semibold text-sm truncate" title={item.task}>{item.task}</h3>
                                </div>
                                {item.subject && (
                                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] bg-black/30 font-bold tracking-wider uppercase">
                                        {item.subject}
                                    </span>
                                )}
                            </div>
                        </motion.div>
                    ))}

                    <div className="pt-6 flex justify-center">
                        <Link href="/timetable" className="px-6 py-2 rounded-full bg-slate-800 text-xs font-semibold text-blue-400 hover:bg-slate-700 transition-all border border-slate-700">
                            View Full Week →
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-2">
                        <CalendarIcon className="w-8 h-8 opacity-40 text-blue-400" />
                    </div>
                    <div>
                        <p className="font-semibold text-slate-300">No Plan for {today}</p>
                        <p className="text-sm opacity-60 mb-4">You haven't generated a weekly schedule yet.</p>
                        <Link href="/timetable" className="inline-block bg-blue-500 text-white font-bold px-6 py-2 rounded-full text-sm hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20">
                            Generate My Week
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
