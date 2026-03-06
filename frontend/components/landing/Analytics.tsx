'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Activity, TrendingUp } from 'lucide-react';

export default function Analytics() {
    return (
        <section id="analytics" className="py-24 bg-slate-950 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                    {/* Text */}
                    <div>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6"
                        >
                            <Activity className="w-4 h-4" />
                            <span>Detailed Analytics</span>
                        </motion.div>
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                            Measure What Matters.
                        </h2>
                        <p className="text-slate-400 text-lg leading-relaxed mb-8">
                            Track your Ability Score growth, topic mastery, and response time.
                            See noticeable improvement in just 2 weeks of adaptive practice.
                        </p>

                        <div className="grid grid-cols-2 gap-8">
                            {[
                                { label: "Questions Solved", value: "1,240+", color: "text-blue-400" },
                                { label: "Concepts Mastered", value: "85%", color: "text-green-400" },
                                { label: "Avg Speed Improved", value: "12%", color: "text-purple-400" },
                                { label: "Weak Areas Fixed", value: "24", color: "text-orange-400" }
                            ].map((stat, i) => (
                                <div key={i}>
                                    <div className={`text-3xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
                                    <div className="text-slate-500 text-sm">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Chart Visuals */}
                    <div className="grid gap-6">
                        {/* Ability Growth Chart */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="bg-slate-900 rounded-2xl border border-slate-800 p-6"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h4 className="text-white font-semibold flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-green-500" />
                                    Ability Score Growth
                                </h4>
                            </div>
                            <div className="h-40 flex items-end justify-between gap-2">
                                {[30, 45, 40, 55, 60, 65, 75, 85].map((h, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ height: 0 }}
                                        whileInView={{ height: `${h}%` }}
                                        transition={{ duration: 1, delay: i * 0.1 }}
                                        className="w-full bg-indigo-500/20 rounded-t-sm hover:bg-indigo-500/40 transition-colors relative group"
                                    >
                                        <div className="absolute bottom-0 w-full bg-indigo-500 h-1 rounded-b-sm" />

                                        {/* Tooltip */}
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                            Score: {h / 100}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Mastery Bar */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="bg-slate-900 rounded-2xl border border-slate-800 p-6"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-white font-semibold flex items-center gap-2">
                                    <BarChart className="w-4 h-4 text-purple-500" />
                                    Topic Mastery Distribution
                                </h4>
                            </div>
                            <div className="space-y-4">
                                {[
                                    { label: 'Calculus', val: 82, color: 'bg-green-500' },
                                    { label: 'Mechanics', val: 45, color: 'bg-yellow-500' },
                                    { label: 'Optics', val: 25, color: 'bg-red-500' },
                                ].map((item, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                                            <span>{item.label}</span>
                                            <span>{item.val}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                whileInView={{ width: `${item.val}%` }}
                                                transition={{ duration: 1, delay: 0.4 + (i * 0.2) }}
                                                className={`h-full ${item.color}`}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                </div>
            </div>
        </section>
    );
}
