'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

export default function Diagnostic() {
    return (
        <section className="py-24 bg-slate-900 border-y border-slate-800 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-900/20 to-transparent pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                    {/* Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-6">
                            <TrendingUp className="w-4 h-4" />
                            <span>Smart Diagnosis</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                            We Don&apos;t Just Test.<br />
                            <span className="text-indigo-400">We Diagnose.</span>
                        </h2>
                        <p className="text-slate-400 text-lg leading-relaxed mb-8">
                            Most platforms just give you a score. Neuromind analyzes <strong>why</strong> you missed a question.
                            Our adaptive engine calibrates difficulty in real-time to find your exact breaking point.
                        </p>

                        <div className="space-y-4">
                            {[
                                "Start with calibrated calibration questions",
                                "System adapts based on response time & accuracy",
                                "Stops early if concept mastery is confirmed weak",
                                "Classifies you as Weak, Intermediate, or Expert"
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-indigo-500 mt-1 shrink-0" />
                                    <span className="text-slate-300">{item}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Visualizer */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="relative"
                    >
                        <div className="bg-slate-950 rounded-2xl border border-slate-800 p-8 shadow-2xl relative z-10">
                            <div className="flex justify-between items-center mb-8">
                                <div className="text-white font-semibold">Live Difficulty Adjustment</div>
                                <div className="text-xs text-slate-500">Real-time Session</div>
                            </div>

                            {/* Animated Graph Steps */}
                            <div className="space-y-6 relative">
                                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-800" />

                                {[
                                    { level: 'Easy', status: 'Correct', color: 'bg-green-500', w: 'w-16' },
                                    { level: 'Medium', status: 'Correct', color: 'bg-green-500', w: 'w-24' },
                                    { level: 'Hard', status: 'Wrong', color: 'bg-red-500', w: 'w-32' },
                                    { level: 'Medium', status: 'Correct', color: 'bg-green-500', w: 'w-24' },
                                ].map((step, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.2 + (i * 0.2) }}
                                        className="flex items-center gap-4 relative z-10"
                                    >
                                        <div className={`w-3 h-3 rounded-full ${step.status === 'Correct' ? 'bg-green-500' : 'bg-red-500'} ring-4 ring-slate-950`} />
                                        <div className="flex-1">
                                            <div className="flex justify-between text-xs text-slate-400 mb-1">
                                                <span>{step.level}</span>
                                                <span>{step.status}</span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    whileInView={{ width: '100%' }}
                                                    transition={{ duration: 0.8, delay: 0.2 + (i * 0.2) }}
                                                    className={`h-full ${step.color} rounded-full`}
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Result Badge */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.2 }}
                                className="mt-8 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center gap-3"
                            >
                                <AlertCircle className="w-6 h-6 text-orange-400" />
                                <div>
                                    <div className="text-orange-400 font-bold text-sm">Diagnosis: Intermediate</div>
                                    <div className="text-orange-400/80 text-xs">Recommended: Focus on advanced concepts</div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Decor elements */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-600/20 rounded-full blur-3xl -z-10" />
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-600/20 rounded-full blur-3xl -z-10" />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
