'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, MessageSquare, Lightbulb, PlayCircle } from 'lucide-react';

export default function AITutor() {
    return (
        <section id="features" className="py-24 bg-slate-950 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                    {/* Mock AI Interface */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="order-2 lg:order-1 relative"
                    >
                        <div className="bg-slate-900 rounded-2xl border border-indigo-500/30 shadow-[0_0_50px_rgba(99,102,241,0.15)] p-6 md:p-8">
                            {/* Header */}
                            <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold">AI Tutor</h3>
                                    <span className="text-indigo-400 text-xs">Online • Answering now</span>
                                </div>
                            </div>

                            {/* Chat Content */}
                            <div className="space-y-6">
                                {/* Mistake Analysis */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="bg-slate-950/50 rounded-xl p-4 border border-red-500/20"
                                >
                                    <div className="flex items-center gap-2 text-red-400 text-sm font-semibold mb-2">
                                        <AlertCircleIcon /> Mistake Analysis
                                    </div>
                                    <p className="text-slate-300 text-sm">
                                        You applied the formula for <em>Projectiles</em> instead of <em>Free Fall</em>. Since angle theta = 90°, the horizontal component is zero.
                                    </p>
                                </motion.div>

                                {/* Solution Step */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="bg-indigo-900/10 rounded-xl p-4 border border-indigo-500/20"
                                >
                                    <div className="flex items-center gap-2 text-indigo-400 text-sm font-semibold mb-2">
                                        <Lightbulb className="w-4 h-4" /> Step-by-Step Solution
                                    </div>
                                    <div className="text-slate-300 text-sm space-y-2 font-mono">
                                        <p>1. Identify initial velocity (u) = 0</p>
                                        <p>2. Use equation: v² = u² + 2as</p>
                                        <p>3. Substitute a = 9.8 m/s²</p>
                                    </div>
                                </motion.div>

                                {/* Practice Suggestion */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.8 }}
                                    className="pt-2"
                                >
                                    <button className="w-full bg-slate-800 hover:bg-slate-750 text-white rounded-lg p-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors">
                                        <PlayCircle className="w-4 h-4 text-emerald-400" />
                                        Solve 3 Similar Questions
                                    </button>
                                </motion.div>
                            </div>
                        </div>

                        {/* Floating Badges */}
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -top-6 -right-6 bg-slate-800 border border-slate-700 p-3 rounded-lg shadow-xl"
                        >
                            <span className="text-white text-sm font-bold">24/7 Availability</span>
                        </motion.div>
                    </motion.div>

                    {/* Text Content */}
                    <div className="order-1 lg:order-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-6">
                            <MessageSquare className="w-4 h-4" />
                            <span>Instant Doubt Solving</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                            Stuck? Get Instant <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                                AI Explanations.
                            </span>
                        </h2>
                        <p className="text-slate-400 text-lg leading-relaxed mb-8">
                            No more waiting for teachers or searching generic videos. Our AI analyzes your specific mistake and explains it in a way <strong>you</strong> understand.
                        </p>

                        <div className="grid grid-cols-2 gap-6">
                            {[
                                { title: "Mistake ID", desc: "Pinpoints exactly where you went wrong" },
                                { title: "Step-by-Step", desc: "Breaks down complex problems" },
                                { title: "Micro-Practice", desc: "Generates similar questions instantly" },
                                { title: "Concept Link", desc: "Maps back to core textbook concepts" }
                            ].map((feature, i) => (
                                <div key={i}>
                                    <h4 className="text-white font-bold mb-1">{feature.title}</h4>
                                    <p className="text-slate-500 text-sm">{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}

function AlertCircleIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
    )
}
