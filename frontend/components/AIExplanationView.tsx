'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Sparkles, Youtube, Lightbulb,
    CheckCircle2, AlertCircle, ArrowRight
} from 'lucide-react';
import { Button } from './ui/Button';
import { cn } from '@/lib/utils';
import { AIExplanationResponse } from '@/services/testService';

interface AIExplanationViewProps {
    data: AIExplanationResponse['data'];
    onClose: () => void;
}

export default function AIExplanationView({ data, onClose }: AIExplanationViewProps) {
    // Extract video ID from common YouTube URL formats
    const getEmbedUrl = (url?: string) => {
        if (!url) return null;
        let videoId = '';
        if (url.includes('v=')) {
            videoId = url.split('v=')[1].split('&')[0];
        } else if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1].split('?')[0];
        } else if (url.includes('embed/')) {
            videoId = url.split('embed/')[1].split('?')[0];
        }

        if (videoId) {
            return `https://www.youtube.com/embed/${videoId}`;
        }
        return null;
    };

    const embedUrl = getEmbedUrl(data.youtube_link);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            >
                {/* Header */}
                <div className="shrink-0 p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                            <Sparkles className="text-indigo-400" size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">AI Concept Breakdown</h2>
                            <p className="text-xs text-slate-500">Personalized explanation based on your answer</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

                    {/* Explanation Section */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 text-indigo-400">
                            <Lightbulb size={18} />
                            <h3 className="font-bold tracking-tight">Simple Explanation</h3>
                        </div>
                        <p className="text-slate-300 leading-relaxed bg-slate-800/30 p-4 rounded-xl border border-slate-800">
                            {data.explanation}
                        </p>
                    </section>

                    {/* Video Section */}
                    {data.youtube_link && (
                        <section className="space-y-4">
                            <div className="flex items-center gap-2 text-rose-400">
                                <Youtube size={18} />
                                <h3 className="font-bold tracking-tight">Recommended Video Tutorial</h3>
                            </div>

                            {embedUrl ? (
                                <div className="aspect-video w-full rounded-xl overflow-hidden border border-slate-800 bg-black">
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        src={embedUrl}
                                        title="YouTube video player"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            ) : (
                                <a
                                    href={data.youtube_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 hover:bg-rose-500/10 transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <Youtube className="text-rose-500" />
                                        <span className="text-slate-200 font-medium">Watch on YouTube</span>
                                    </div>
                                    <ArrowRight size={18} className="text-slate-500 group-hover:translate-x-1 transition-transform" />
                                </a>
                            )}
                        </section>
                    )}

                    {/* Mistake & Solution Grid */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <section className="space-y-3">
                            <div className="flex items-center gap-2 text-amber-400">
                                <AlertCircle size={18} />
                                <h3 className="text-sm font-bold uppercase tracking-wider">The Common Mistake</h3>
                            </div>
                            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 text-slate-300 text-sm leading-relaxed">
                                {data.mistake_reason}
                            </div>
                        </section>

                        <section className="space-y-3">
                            <div className="flex items-center gap-2 text-emerald-400">
                                <CheckCircle2 size={18} />
                                <h3 className="text-sm font-bold uppercase tracking-wider">Step-by-Step Fix</h3>
                            </div>
                            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                                {data.step_by_step_solution}
                            </div>
                        </section>
                    </div>

                    {/* Next Steps */}
                    <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20 flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                            <Sparkles size={16} className="text-indigo-400" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-white mb-1">Recommended Next Step</h4>
                            <p className="text-sm text-slate-400">{data.recommended_next_step}</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="shrink-0 p-4 border-t border-slate-800 bg-slate-900/80 backdrop-blur-md flex justify-end">
                    <Button onClick={onClose} variant="secondary">
                        Back to Test
                    </Button>
                </div>
            </motion.div>
        </motion.div>
    );
}
