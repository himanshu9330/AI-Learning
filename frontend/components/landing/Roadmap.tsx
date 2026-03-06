'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle2, Circle } from 'lucide-react';

const schedule = [
    { day: "Mon", task: "Concept Revision: Calculus", type: "concept", color: "bg-blue-500" },
    { day: "Tue", task: "Easy Practice: Limits", type: "easy", color: "bg-green-500" },
    { day: "Wed", task: "Medium Practice: Derivatives", type: "medium", color: "bg-yellow-500" },
    { day: "Thu", task: "Hard Practice: Applications", type: "hard", color: "bg-red-500" },
    { day: "Fri", task: "Weekly Diagnostic Test", type: "test", color: "bg-purple-500" },
    { day: "Sat", task: "Weak Area Focus: Integration", type: "focus", color: "bg-indigo-500" },
    { day: "Sun", task: "Rest & Review", type: "rest", color: "bg-slate-500" }
];

export default function Roadmap() {
    return (
        <section id="roadmap" className="py-24 bg-slate-900 border-y border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-4"
                    >
                        <Calendar className="w-4 h-4" />
                        <span>Automated Planning</span>
                    </motion.div>
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                        Your Weekly Plan,<br />
                        <span className="text-emerald-400">Automatically Generated.</span>
                    </h2>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        No more confusion about what to study. Based on your weak areas and exam date,
                        we build your schedule for you.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {schedule.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            className={`p-6 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors ${index === 4 ? 'col-span-1 md:col-span-2 lg:col-span-1 bg-gradient-to-br from-slate-900 to-slate-950 border-purple-500/30' : ''}`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-slate-500 font-bold uppercase text-xs tracking-wider">
                                    {item.day}
                                </span>
                                {index < 3 ? (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                ) : (
                                    <Circle className="w-5 h-5 text-slate-700" />
                                )}
                            </div>

                            <div className="flex items-center gap-3 mb-2">
                                <div className={`w-2 h-2 rounded-full ${item.color}`} />
                                <h4 className="text-white font-semibold text-sm line-clamp-1">
                                    {item.task.split(":")[0]}
                                </h4>
                            </div>

                            <p className="text-slate-400 text-xs pl-5">
                                {item.task.split(":")[1] || "Recovery Mode"}
                            </p>

                            {/* Focus Tag */}
                            {index === 4 && (
                                <div className="mt-4 inline-block px-2 py-1 bg-purple-500/10 rounded text-purple-400 text-xs font-semibold border border-purple-500/20">
                                    High Priority
                                </div>
                            )}
                        </motion.div>
                    ))}

                    {/* Placeholder for "View Full Calendar" */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.8 }}
                        className="p-6 rounded-2xl border-2 border-dashed border-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-300 hover:border-slate-600 transition-all cursor-pointer group"
                    >
                        <span className="group-hover:scale-105 transition-transform flex items-center gap-2">
                            View Full Calendar <ArrowRight className="w-4 h-4" />
                        </span>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

function ArrowRight() {
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
}
