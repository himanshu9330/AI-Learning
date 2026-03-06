'use client';

import { useState, useEffect } from 'react';
import {
    X,
    Sparkles,
    Lightbulb,
    AlertCircle,
    ChevronRight,
    Loader2,
    CheckCircle2
} from 'lucide-react';
import aiService, { AIExplanation } from '@/services/aiService';
import { motion, AnimatePresence } from 'framer-motion';

interface ExplanationModalProps {
    isOpen: boolean;
    onClose: () => void;
    questionId: string;
    studentAnswer: string;
    masteryLevel: number;
    explanation?: string;
}

export default function ExplanationModal({
    isOpen,
    onClose,
    questionId,
    studentAnswer,
    masteryLevel,
    explanation: initialExplanation
}: ExplanationModalProps) {
    const [explanation, setExplanation] = useState<AIExplanation | null>(
        initialExplanation ? {
            explanation: initialExplanation,
            mistake_reason: '',
            step_by_step_solution: '',
            recommended_next_step: '',
            micro_practice_questions: []
        } : null
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchExplanation = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await aiService.getExplanation(
                questionId,
                studentAnswer,
                masteryLevel
            );
            setExplanation(response.data.ai_explanation);
        } catch (err) {
            console.error('Failed to fetch explanation:', err);
            setError('The AI tutor is currently busy. Please try again in a moment.');
        } finally {
            setLoading(false);
        }
    };

    // Auto-fetch when modal opens if not already loaded
    useEffect(() => {
        if (isOpen && !explanation && !loading && !initialExplanation) {
            fetchExplanation();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                    {/* Header */}
                    <div className="bg-purple-600 p-6 text-white flex justify-between items-center relative">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-xl">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">AI Tutor Explanation</h3>
                                <p className="text-purple-100 text-xs">Personalized for your level: {(masteryLevel * 10).toFixed(0)}/10</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-8">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
                                <p className="text-gray-500 font-medium">Analyzing your answer & synthesizing explanation...</p>
                            </div>
                        ) : error ? (
                            <div className="text-center py-20">
                                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4 opacity-50" />
                                <p className="text-gray-900 dark:text-white font-bold text-lg mb-2">Oops!</p>
                                <p className="text-gray-500 dark:text-gray-400">{error}</p>
                                <button
                                    onClick={fetchExplanation}
                                    className="mt-6 px-6 py-2 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700"
                                >
                                    Retry
                                </button>
                            </div>
                        ) : (
                            explanation && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="space-y-8"
                                >
                                    {/* Concept Overview */}
                                    <section>
                                        <div className="flex items-center gap-2 text-purple-600 mb-2 font-bold uppercase tracking-wider text-xs">
                                            <Lightbulb className="w-4 h-4" />
                                            Concept Overview
                                        </div>
                                        <p className="text-gray-700 dark:text-gray-200 leading-relaxed text-lg">
                                            {explanation.explanation}
                                        </p>
                                    </section>

                                    {/* Mistake Analysis */}
                                    <section className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-2xl border border-orange-100 dark:border-orange-800">
                                        <h4 className="flex items-center gap-2 text-orange-700 dark:text-orange-300 font-bold mb-3">
                                            <AlertCircle className="w-5 h-5" />
                                            Why you might have missed it
                                        </h4>
                                        <p className="text-orange-800 dark:text-orange-200 text-sm leading-relaxed">
                                            {explanation.mistake_reason}
                                        </p>
                                    </section>

                                    {/* Step by Step */}
                                    <section>
                                        <h4 className="text-gray-900 dark:text-white font-bold mb-4 text-lg border-b-2 border-gray-100 dark:border-gray-700 pb-2">Step-by-Step Solution</h4>
                                        <div className="space-y-4">
                                            {explanation.step_by_step_solution.split('\n').filter((s: string) => s.trim()).map((step: string, i: number) => (
                                                <div key={i} className="flex gap-4">
                                                    <div className="flex-shrink-0 w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center font-bold text-gray-500">
                                                        {i + 1}
                                                    </div>
                                                    <p className="text-gray-600 dark:text-gray-400 text-sm py-1.5">{step.replace(/^\d+\.\s*/, '')}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </section>

                                    {/* Next Step */}
                                    <section className="bg-green-50 dark:bg-green-900/20 p-6 rounded-2xl border border-green-100 dark:border-green-800">
                                        <h4 className="flex items-center gap-2 text-green-700 dark:text-green-300 font-bold mb-2">
                                            <CheckCircle2 className="w-5 h-5" />
                                            Recommended Next Step
                                        </h4>
                                        <p className="text-green-800 dark:text-green-200 text-sm">
                                            {explanation.recommended_next_step}
                                        </p>
                                    </section>
                                </motion.div>
                            )
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-2xl hover:opacity-90 transition-opacity"
                        >
                            Got it, thanks!
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
