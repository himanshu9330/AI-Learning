'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Youtube,
    Link as LinkIcon,
    Sparkles,
    Clock,
    BookOpen,
    Target,
    Lightbulb,
    Activity,
    ListChecks,
    ChevronLeft,
    Download,
    Share2,
    Loader2,
    AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import apiClient from '@/lib/apiClient';
import toast, { Toaster } from 'react-hot-toast';
import Navbar from '@/components/landing/Navbar';

interface TopicTimestamp {
    timestamp: string;
    topic: string;
}

interface VideoSummary {
    main_topic: string;
    key_concepts: string[];
    definitions_and_formulas: string[];
    step_by_step_explanations: string[];
    timestamps: TopicTimestamp[];
    practical_applications: string[];
    exam_points: string[];
    quick_revision: string;
}

interface SummarizerResponse {
    video_id: string;
    title: string;
    summary: VideoSummary;
}

export default function SummarizerPage() {
    const [url, setUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<SummarizerResponse | null>(null);

    const handleSummarize = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;

        try {
            setIsLoading(true);
            setResult(null);

            const response = await apiClient.post('video/summarize', { youtube_url: url });
            setResult(response.data.data);
            toast.success('Summary generated successfully!');
        } catch (error: any) {
            console.error('Summarization error:', error);
            const message = error.response?.data?.message || 'Failed to summarize video. Make sure it has a transcript.';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <main className="min-h-screen bg-slate-950 text-slate-200">
            <Toaster position="top-center" reverseOrder={false} />
            <Navbar />

            <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-6"
                    >
                        <Sparkles className="w-4 h-4" />
                        <span>AI-Powered Learning</span>
                    </motion.div>
                    <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-4xl md:text-5xl font-bold text-white mb-4"
                    >
                        YouTube Video <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Summarizer</span>
                    </motion.h1>
                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-slate-400 text-lg max-w-2xl mx-auto"
                    >
                        Transform any educational video into structured, exam-ready study notes in seconds.
                    </motion.p>
                </div>

                {/* Search Card */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="max-w-3xl mx-auto mb-16"
                >
                    <Card className="p-2 bg-slate-900/50 backdrop-blur-xl border-slate-800 shadow-2xl overflow-hidden group">
                        <form onSubmit={handleSummarize} className="flex flex-col sm:flex-row gap-2">
                            <div className="flex-1 relative">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-500 transition-colors">
                                    <LinkIcon className="w-5 h-5" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Paste YouTube URL here (e.g., https://youtube.com/watch?v=...)"
                                    className="w-full bg-transparent border-0 focus:ring-0 text-white placeholder-slate-500 py-4 pl-12 pr-4 rounded-xl"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={isLoading || !url}
                                variant="gradient"
                                className="px-8 py-4 sm:py-0 h-auto sm:h-auto rounded-xl shadow-lg shadow-indigo-500/20"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                        Summarizing...
                                    </>
                                ) : (
                                    <>
                                        <Youtube className="w-5 h-5 mr-2" />
                                        Generate Summary
                                    </>
                                )}
                            </Button>
                        </form>
                    </Card>
                    <p className="text-center text-slate-500 text-xs mt-4 flex items-center justify-center gap-2">
                        <AlertCircle className="w-3 h-3" />
                        Note: Works best on educational videos with subtitles/captions enabled.
                    </p>
                </motion.div>

                {/* Result Section */}
                <AnimatePresence mode="wait">
                    {result ? (
                        <motion.div
                            key="result"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="space-y-8"
                        >
                            {/* Title & Actions */}
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-8">
                                <motion.div variants={itemVariants} className="max-w-3xl">
                                    <h2 className="text-2xl font-bold text-white mb-2 line-clamp-2">
                                        {result.title}
                                    </h2>
                                    <div className="flex items-center gap-3 text-slate-400 text-sm">
                                        <span className="flex items-center gap-1">
                                            <Youtube className="w-4 h-4 text-red-500" />
                                            YouTube Educational Content
                                        </span>
                                        <span className="w-1 h-1 rounded-full bg-slate-700" />
                                        <span>Video ID: {result.video_id}</span>
                                    </div>
                                </motion.div>
                                <motion.div variants={itemVariants} className="flex gap-3">
                                    <Button variant="outline" size="sm" className="gap-2 border-slate-700 bg-slate-900/50">
                                        <Download className="w-4 h-4" />
                                        Export PDF
                                    </Button>
                                    <Button variant="outline" size="sm" className="gap-2 border-slate-700 bg-slate-900/50">
                                        <Share2 className="w-4 h-4" />
                                        Share
                                    </Button>
                                </motion.div>
                            </div>

                            {/* Main Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Left Column: Core Summary */}
                                <div className="lg:col-span-2 space-y-8">
                                    {/* Main Overview */}
                                    <motion.section variants={itemVariants}>
                                        <Card className="p-8 bg-slate-900/30 border-slate-800/60 transition-all hover:bg-slate-900/50">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                                                    <BookOpen className="w-6 h-6" />
                                                </div>
                                                <h3 className="text-xl font-bold text-white">Main Topic Overview</h3>
                                            </div>
                                            <p className="text-slate-300 leading-relaxed text-lg">
                                                {result.summary.main_topic}
                                            </p>
                                        </Card>
                                    </motion.section>

                                    {/* Key Concepts */}
                                    <motion.section variants={itemVariants}>
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                                                <Lightbulb className="w-6 h-6" />
                                            </div>
                                            <h3 className="text-xl font-bold text-white">Key Concepts</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {result.summary.key_concepts.map((concept, idx) => (
                                                <Card key={idx} className="p-5 bg-slate-900/30 border-slate-800/60 hover:border-emerald-500/30 transition-all">
                                                    <p className="text-slate-300 text-sm leading-relaxed">
                                                        {concept}
                                                    </p>
                                                </Card>
                                            ))}
                                        </div>
                                    </motion.section>

                                    {/* Definitions & Formulas */}
                                    {result.summary.definitions_and_formulas.length > 0 && (
                                        <motion.section variants={itemVariants}>
                                            <Card className="p-8 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 border-indigo-500/20 shadow-xl shadow-indigo-500/5">
                                                <div className="flex items-center gap-3 mb-6">
                                                    <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                                                        <Sparkles className="w-6 h-6" />
                                                    </div>
                                                    <h3 className="text-xl font-bold text-white">Definitions & Formulas</h3>
                                                </div>
                                                <ul className="space-y-4">
                                                    {result.summary.definitions_and_formulas.map((item, idx) => (
                                                        <li key={idx} className="flex items-start gap-3">
                                                            <div className="mt-2 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                                                            <span className="text-slate-200 font-mono text-sm">{item}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </Card>
                                        </motion.section>
                                    )}

                                    {/* Step-by-Step */}
                                    <motion.section variants={itemVariants}>
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                                                <ListChecks className="w-6 h-6" />
                                            </div>
                                            <h3 className="text-xl font-bold text-white">Step-by-Step Explanation</h3>
                                        </div>
                                        <div className="space-y-4">
                                            {result.summary.step_by_step_explanations.map((step, idx) => (
                                                <div key={idx} className="flex gap-4">
                                                    <div className="shrink-0 w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-bold text-white">
                                                        {idx + 1}
                                                    </div>
                                                    <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/60 text-slate-300 text-sm flex-1">
                                                        {step}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.section>
                                </div>

                                {/* Right Column: Sidebar */}
                                <div className="space-y-8">
                                    {/* Exam Points */}
                                    <motion.section variants={itemVariants}>
                                        <Card className="p-6 bg-rose-500/5 border-rose-500/20">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
                                                    <Target className="w-6 h-6" />
                                                </div>
                                                <h3 className="text-lg font-bold text-white">Exam Relevant</h3>
                                            </div>
                                            <ul className="space-y-4">
                                                {result.summary.exam_points.map((point, idx) => (
                                                    <li key={idx} className="flex items-start gap-3">
                                                        <div className="mt-2 w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                                                        <span className="text-slate-300 text-sm">{point}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </Card>
                                    </motion.section>

                                    {/* Timestamps */}
                                    <motion.section variants={itemVariants}>
                                        <Card className="p-6 bg-slate-900/30 border-slate-800/60">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                                                    <Clock className="w-6 h-6" />
                                                </div>
                                                <h3 className="text-lg font-bold text-white">Topic Breakdown</h3>
                                            </div>
                                            <div className="space-y-4">
                                                {result.summary.timestamps.map((ts, idx) => (
                                                    <div key={idx} className="flex items-center justify-between group cursor-pointer">
                                                        <span className="text-slate-400 text-sm group-hover:text-white transition-colors">
                                                            {ts.topic}
                                                        </span>
                                                        <span className="px-2 py-1 rounded bg-slate-800 text-indigo-400 text-xs font-mono font-bold group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                                            {ts.timestamp}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </Card>
                                    </motion.section>

                                    {/* Practical Applications */}
                                    <motion.section variants={itemVariants}>
                                        <Card className="p-6 bg-slate-900/30 border-slate-800/60">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                                                    <Activity className="w-6 h-6" />
                                                </div>
                                                <h3 className="text-lg font-bold text-white">Real-world Application</h3>
                                            </div>
                                            <ul className="space-y-3">
                                                {result.summary.practical_applications.map((app, idx) => (
                                                    <li key={idx} className="text-slate-400 text-sm italic">
                                                        "{app}"
                                                    </li>
                                                ))}
                                            </ul>
                                        </Card>
                                    </motion.section>

                                    {/* Quick Revision */}
                                    <motion.section variants={itemVariants}>
                                        <Card className="p-6 bg-indigo-600/10 border-indigo-500/30 text-center">
                                            <h4 className="text-white font-bold mb-3">Quick Revision</h4>
                                            <p className="text-slate-400 text-sm leading-relaxed italic">
                                                {result.summary.quick_revision}
                                            </p>
                                        </Card>
                                    </motion.section>
                                </div>
                            </div>

                            {/* Back Button */}
                            <motion.div variants={itemVariants} className="pt-8">
                                <Button
                                    variant="outline"
                                    onClick={() => setResult(null)}
                                    className="border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900"
                                >
                                    <ChevronLeft className="w-4 h-4 mr-2" />
                                    Summarize Another Video
                                </Button>
                            </motion.div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="placeholder"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-20 opacity-50"
                        >
                            <div className="w-24 h-24 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-6">
                                <BookOpen className="w-8 h-8 text-slate-700" />
                            </div>
                            <p className="text-slate-600">Enter a video link above to see the magic happen.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
}
