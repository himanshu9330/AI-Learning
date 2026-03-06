'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Target, Sliders, Map, ArrowRight } from 'lucide-react';

const steps = [
    {
        icon: Target,
        title: "Select Goal",
        desc: "Choose your target exam (JEE/NEET) and specific chapter.",
        color: "text-blue-400",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20"
    },
    {
        icon: BookOpen,
        title: "Start Diagnostic",
        desc: "Begin with calibrated questions to assess your baseline.",
        color: "text-purple-400",
        bg: "bg-purple-500/10",
        border: "border-purple-500/20"
    },
    {
        icon: Sliders,
        title: "Adaptive Engine",
        desc: "System adjusts difficulty in real-time based on your answers.",
        color: "text-pink-400",
        bg: "bg-pink-500/10",
        border: "border-pink-500/20"
    },
    {
        icon: Map,
        title: "Get Roadmap",
        desc: "Receive a personalized weekly plan to fix weak areas.",
        color: "text-indigo-400",
        bg: "bg-indigo-500/10",
        border: "border-indigo-500/20"
    }
];

export default function HowItWorks() {
    return (
        <section id="how-it-works" className="py-24 bg-slate-950 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                        How It Works
                    </h2>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        A smart loop designed to optimize your study time and maximize score improvement.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{ y: -10 }}
                            className={`p-6 rounded-2xl border ${step.border} bg-slate-900/50 backdrop-blur-sm relative overflow-hidden group`}
                        >
                            <div className={`absolute inset-0 ${step.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                            <div className="relative z-10">
                                <div className={`w-12 h-12 rounded-lg ${step.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                    <step.icon className={`w-6 h-6 ${step.color}`} />
                                </div>

                                <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    {step.desc}
                                </p>
                            </div>

                            {index < steps.length - 1 && (
                                <div className="hidden lg:block absolute top-1/2 -right-4 z-20 text-slate-700">
                                    <ArrowRight className="w-6 h-6" />
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
