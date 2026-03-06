'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Zap, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Hero() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950 pt-20">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute top-[20%] right-[20%] w-[20%] h-[20%] bg-blue-600/10 rounded-full blur-[80px]" />
            </div>

            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center z-10">
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/50 border border-slate-800 backdrop-blur-sm mb-8"
                >
                    <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                    <span className="text-sm font-medium text-slate-300">AI-Powered Learning V1.0</span>
                </motion.div>

                {/* Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 max-w-4xl"
                >
                    Your Personal{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                        AI Exam Coach
                    </span>
                </motion.h1>

                {/* Subheadline */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed"
                >
                    Adaptive testing. Smart chapter diagnosis. AI-powered explanations.
                    Personalized roadmap. Prepare smarter, not just harder.
                </motion.p>

                {/* Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
                >
                    <Link href="/test">
                        <button className="group relative px-8 py-4 bg-white text-slate-950 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl hover:shadow-white/20 transition-all hover:-translate-y-1 overflow-hidden">
                            <span className="relative z-10 flex items-center gap-2">
                                Start Diagnostic Test
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                    </Link>

                    <Link href="#how-it-works">
                        <button className="px-8 py-4 bg-slate-900 text-white border border-slate-800 rounded-full font-semibold text-lg hover:bg-slate-800 transition-all hover:-translate-y-1">
                            Explore How It Works
                        </button>
                    </Link>
                </motion.div>

                {/* Stats / Trust */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="mt-20 pt-10 border-t border-slate-800 w-full max-w-3xl flex justify-center sm:justify-between gap-8 text-slate-400"
                >
                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-2 text-white font-bold text-2xl">
                            <Zap className="w-6 h-6 text-yellow-400" /> 2x
                        </div>
                        <span className="text-sm">Faster Learning</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-2 text-white font-bold text-2xl">
                            <Brain className="w-6 h-6 text-purple-400" /> 95%
                        </div>
                        <span className="text-sm">Adaptability Score</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-2 text-white font-bold text-2xl">
                            <Sparkles className="w-6 h-6 text-indigo-400" /> 24/7
                        </div>
                        <span className="text-sm">AI Tutor Access</span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
