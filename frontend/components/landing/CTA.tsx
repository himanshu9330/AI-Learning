'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function CTA() {
    return (
        <section className="py-32 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-indigo-900">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-4xl md:text-6xl font-bold text-white mb-8"
                >
                    Stop Guessing. <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-pink-200">
                        Start Improving.
                    </span>
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-indigo-100/80 text-xl mb-12 max-w-2xl mx-auto"
                >
                    Join thousands of students who are mastering concepts faster with Neuromind&apos;s AI-powered adaptive engine.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                    <Link href="/test">
                        <button className="px-8 py-4 bg-white text-indigo-900 rounded-full font-bold text-lg hover:shadow-2xl hover:shadow-indigo-500/50 hover:scale-105 transition-all w-full sm:w-auto flex items-center justify-center gap-2">
                            Start Free Diagnostic
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </Link>
                    <Link href="/login">
                        <button className="px-8 py-4 bg-indigo-800 text-white border border-indigo-700 rounded-full font-semibold text-lg hover:bg-indigo-700 transition-all w-full sm:w-auto">
                            Sign In / Register
                        </button>
                    </Link>
                </motion.div>
            </div>

            {/* Glows */}
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-500/30 rounded-full blur-[100px]" />
            <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/30 rounded-full blur-[100px]" />
        </section>
    );
}
