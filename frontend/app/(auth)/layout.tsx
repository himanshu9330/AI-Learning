'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Brain, CheckCircle2, TrendingUp, Shield } from 'lucide-react';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen w-full flex bg-slate-950">
            {/* Left Side - Marketing (Hidden on Mobile) */}
            <div className="hidden lg:flex w-1/2 bg-slate-900 border-r border-slate-800 relative overflow-hidden flex-col justify-between p-12">
                {/* Background FX */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-transparent pointer-events-none" />
                <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-10" />

                {/* Logo */}
                <Link href="/" className="flex items-center space-x-2 relative z-10">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg">
                        <Brain className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold text-white">Neuromind</span>
                </Link>

                {/* Content */}
                <div className="relative z-10 space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h1 className="text-4xl font-bold text-white mb-4">
                            Master Your Exams with <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                                AI-Powered Adaptation
                            </span>
                        </h1>
                        <p className="text-slate-400 text-lg max-w-md">
                            Join thousands of students who are improving their scores by 45% in just 2 weeks.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="space-y-4"
                    >
                        {[
                            { icon: TrendingUp, text: "Real-time difficulty adjustment" },
                            { icon: CheckCircle2, text: "Personalized study roadmaps" },
                            { icon: Shield, text: "Weak area detection & repair" },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="p-2 rounded-full bg-slate-800/80 border border-slate-700 text-indigo-400">
                                    <item.icon size={20} />
                                </div>
                                <span className="text-slate-300 font-medium">{item.text}</span>
                            </div>
                        ))}
                    </motion.div>
                </div>

                {/* Footer */}
                <div className="text-slate-500 text-sm relative z-10">
                    © {new Date().getFullYear()} Neuromind Inc.
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-12 relative">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent pointer-events-none" />

                <div className="w-full max-w-md relative z-10">
                    {children}
                </div>
            </div>
        </div>
    );
}
