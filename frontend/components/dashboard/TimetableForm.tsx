'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, BookOpen, Coffee, GraduationCap, X, Plus, Calendar as CalendarIcon, Loader2, Download, FileText, CalendarDays, ChevronDown } from 'lucide-react';
import apiClient from '@/lib/apiClient';

interface TimetableItem {
    start: string;
    end: string;
    task: string;
    type: "study" | "practice" | "test" | "fixed" | "break" | "extra";
    subject?: string;
}

export default function TimetableForm() {
    const [loading, setLoading] = useState(false);
    const [previewDay, setPreviewDay] = useState<string>("Monday");
    const [weeklySchedule, setWeeklySchedule] = useState<Record<string, TimetableItem[]> | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [subjects, setSubjects] = useState<string[]>(['Physics', 'Chemistry', 'Mathematics']);
    const [newSubject, setNewSubject] = useState('');
    const [wakeTime, setWakeTime] = useState('06:00 AM');
    const [sleepTime, setSleepTime] = useState('11:00 PM');
    const [mealTimes, setMealTimes] = useState('Breakfast 8AM, Lunch 1PM, Dinner 8PM');
    const [profile, setProfile] = useState('Dropper (Full time preparation)');
    const [coachingTime, setCoachingTime] = useState('');
    const [extras, setExtras] = useState('');
    const [showExportMenu, setShowExportMenu] = useState(false);

    useEffect(() => {
        const fetchCurrentTimetable = async () => {
            try {
                const response = await apiClient.get('/timetable/current');
                if (response.data.success && response.data.data) {
                    setWeeklySchedule(response.data.data);
                }
            } catch (err) {
                console.error('Failed to load existing timetable');
            }
        };
        fetchCurrentTimetable();
    }, []);

    const exportToCSV = () => {
        if (!weeklySchedule) return;

        let csv = 'Day,Start,End,Task,Type,Subject\n';
        const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

        days.forEach(day => {
            const daySchedule = weeklySchedule[day] || [];
            daySchedule.forEach(item => {
                csv += `${day},"${item.start}","${item.end}","${item.task}","${item.type}","${item.subject || ''}"\n`;
            });
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `weekly_timetable.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setShowExportMenu(false);
    };

    const exportToCalendar = () => {
        if (!weeklySchedule) return;

        let ics = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//AI Learning//Timetable//EN',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH'
        ];

        const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        const dayMap: Record<string, string> = {
            'Monday': 'MO', 'Tuesday': 'TU', 'Wednesday': 'WE', 'Thursday': 'TH',
            'Friday': 'FR', 'Saturday': 'SA', 'Sunday': 'SU'
        };

        // Get "Generic" dates for the current week to anchor the events
        const now = new Date();
        const monday = new Date(now.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)));

        days.forEach((day, index) => {
            const daySchedule = weeklySchedule[day] || [];
            const targetDate = new Date(monday);
            targetDate.setDate(monday.getDate() + index);

            daySchedule.forEach((item, i) => {
                const parseTime = (t: string) => {
                    const [time, period] = t.split(' ');
                    let [h, m] = time.split(':').map(Number);
                    if (period === 'PM' && h < 12) h += 12;
                    if (period === 'AM' && h === 12) h = 0;
                    return { h, m };
                };

                const start = parseTime(item.start);
                const end = parseTime(item.end);

                const dtStart = new Date(targetDate);
                dtStart.setHours(start.h, start.m, 0);

                const dtEnd = new Date(targetDate);
                dtEnd.setHours(end.h, end.m, 0);

                const formatDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

                ics.push('BEGIN:VEVENT');
                ics.push(`UID:${Date.now()}-${i}-${index}@ailearning.com`);
                ics.push(`DTSTAMP:${formatDate(new Date())}`);
                ics.push(`DTSTART:${formatDate(dtStart)}`);
                ics.push(`DTEND:${formatDate(dtEnd)}`);
                ics.push(`SUMMARY:${item.task}${item.subject ? ` - ${item.subject}` : ''}`);
                ics.push(`DESCRIPTION:Type: ${item.type}`);
                ics.push(`RRULE:FREQ=WEEKLY;BYDAY=${dayMap[day]}`);
                ics.push('END:VEVENT');
            });
        });

        ics.push('END:VCALENDAR');

        const blob = new Blob([ics.join('\r\n')], { type: 'text/calendar;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `weekly_schedule.ics`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setShowExportMenu(false);
    };

    const handleAddSubject = () => {
        if (newSubject.trim() && !subjects.includes(newSubject.trim())) {
            setSubjects([...subjects, newSubject.trim()]);
            setNewSubject('');
        }
    };

    const handleRemoveSubject = (subjectToRemove: string) => {
        setSubjects(subjects.filter(s => s !== subjectToRemove));
    };

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (subjects.length === 0) {
            setError("Please add at least one subject.");
            setLoading(false);
            return;
        }

        try {
            const response = await apiClient.post('/timetable/generate', {
                subjects,
                wakeTime,
                sleepTime,
                mealTimes,
                profile,
                coachingTime,
                extras
            });
            if (response.data.success && response.data.data) {
                setWeeklySchedule(response.data.data);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Failed to generate timetable. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const schedule = weeklySchedule ? weeklySchedule[previewDay] : null;

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

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
            {/* Header */}
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
                    Smart Timetable Generator
                </h1>
                <p className="text-slate-400">
                    Configure your daily routine constraints to receive a personalized, AI-optimized study schedule.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Form Container */}
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none" />

                    <form onSubmit={handleGenerate} className="space-y-6 relative z-10">
                        {/* Profile Selection */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Student Profile</label>
                            <select
                                value={profile}
                                onChange={(e) => setProfile(e.target.value)}
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
                            >
                                <option value="Dropper (Full time preparation)">Dropper (Full time preparation)</option>
                                <option value="School Student (Morning School)">School Student (Morning School)</option>
                                <option value="College Student">College Student</option>
                            </select>
                        </div>

                        {/* Subjects List */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Subjects to Study Today</label>
                            <div className="flex gap-2 mb-3">
                                <input
                                    type="text"
                                    value={newSubject}
                                    onChange={(e) => setNewSubject(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubject())}
                                    placeholder="e.g. Physics"
                                    className="flex-1 bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddSubject}
                                    className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 p-2.5 rounded-xl border border-blue-500/30 transition-colors"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {subjects.map((subject, idx) => (
                                    <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300">
                                        {subject}
                                        <button type="button" onClick={() => handleRemoveSubject(subject)} className="text-slate-500 hover:text-red-400 transition-colors">
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Time Anchors */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Wake Up Time</label>
                                <input
                                    type="text"
                                    value={wakeTime}
                                    onChange={(e) => setWakeTime(e.target.value)}
                                    placeholder="e.g. 06:00 AM"
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Sleep Time</label>
                                <input
                                    type="text"
                                    value={sleepTime}
                                    onChange={(e) => setSleepTime(e.target.value)}
                                    placeholder="e.g. 11:00 PM"
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    required
                                />
                            </div>
                        </div>

                        {/* Commitments & Extras */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Meal Times</label>
                                <input
                                    type="text"
                                    value={mealTimes}
                                    onChange={(e) => setMealTimes(e.target.value)}
                                    placeholder="e.g. Breakfast 8AM, Lunch 1PM"
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Coaching/Classes (Time + Day)</label>
                                <textarea
                                    value={coachingTime}
                                    onChange={(e) => setCoachingTime(e.target.value)}
                                    placeholder="e.g. 1pm-2pm Physics Monday, 12pm-2pm Chemistry Tuesday"
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none h-20"
                                />
                                <p className="text-[10px] text-slate-500 mt-1 italic">Note: AI will automatically block these slots on relevant days.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Hobbies & Extras (Optional)</label>
                                <textarea
                                    value={extras}
                                    onChange={(e) => setExtras(e.target.value)}
                                    placeholder="e.g. 1 hour gym, 30 min reading"
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none h-20"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3.5 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2
                ${loading
                                    ? 'bg-blue-600/50 text-white/50 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40'
                                }`}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Generating Smart Timetable...
                                </>
                            ) : (
                                'Generate Timetable'
                            )}
                        </button>
                    </form>
                </div>

                {/* Schedule Display */}
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden h-[800px] overflow-y-auto custom-scrollbar">
                    {weeklySchedule ? (
                        <div className="space-y-6">
                            <div className="pb-4 border-b border-slate-800">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-semibold text-white">Weekly Preview</h2>
                                    <div className="flex items-center gap-3">
                                        <div className="relative group">
                                            <button
                                                onClick={() => setShowExportMenu(!showExportMenu)}
                                                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-medium text-slate-300 transition-all"
                                            >
                                                <Download className="w-3.5 h-3.5" />
                                                Export
                                                <ChevronDown className={`w-3 h-3 transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
                                            </button>

                                            {showExportMenu && (
                                                <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden">
                                                    <button
                                                        onClick={exportToCSV}
                                                        className="w-full flex items-center gap-3 px-4 py-3 text-left text-xs text-slate-300 hover:bg-slate-800 transition-colors"
                                                    >
                                                        <FileText className="w-4 h-4 text-emerald-400" />
                                                        Export as CSV
                                                    </button>
                                                    <button
                                                        onClick={exportToCalendar}
                                                        className="w-full flex items-center gap-3 px-4 py-3 text-left text-xs text-slate-300 hover:bg-slate-800 transition-colors"
                                                    >
                                                        <CalendarDays className="w-4 h-4 text-blue-400" />
                                                        Export to Calendar
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2 text-[10px] mb-4 overflow-x-auto pb-1 custom-scrollbar">
                                    <span className="flex items-center gap-1 shrink-0"><div className="w-2 h-2 rounded-full bg-blue-400" /> Study</span>
                                    <span className="flex items-center gap-1 shrink-0"><div className="w-2 h-2 rounded-full bg-emerald-400" /> Practice</span>
                                    <span className="flex items-center gap-1 shrink-0"><div className="w-2 h-2 rounded-full bg-purple-400" /> Test</span>
                                    <span className="flex items-center gap-1 shrink-0"><div className="w-2 h-2 rounded-full bg-slate-400" /> Break</span>
                                </div>

                                {/* Day Selector Tabs */}
                                <div className="flex flex-wrap gap-2">
                                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => (
                                        <button
                                            key={day}
                                            type="button"
                                            onClick={() => setPreviewDay(day)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${previewDay === day
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                                                }`}
                                        >
                                            {day.slice(0, 3)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-tighter">{previewDay}'s Agenda</h3>
                                {schedule && schedule.map((item, index) => (
                                    <motion.div
                                        key={`${previewDay}-${index}`}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={`p-4 rounded-xl border flex gap-4 items-start ${getTypeColor(item.type)}`}
                                    >
                                        <div className="w-24 shrink-0 text-sm font-medium mt-0.5 opacity-80">
                                            {item.start}<br /><span className="opacity-60 text-xs">{item.end}</span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                {getTypeIcon(item.type)}
                                                <h3 className="font-semibold">{item.task}</h3>
                                            </div>
                                            {item.subject && (
                                                <span className="inline-block px-2 py-0.5 rounded text-xs bg-black/20 font-medium">
                                                    {item.subject}
                                                </span>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500 p-8 text-center space-y-4">
                            <CalendarIcon className="w-16 h-16 opacity-20" />
                            <p>Fill out your constraints and subjects to generate an AI-optimized weekly schedule.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
