'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertCircle, HelpCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { Question } from '../services/testService';

interface QuestionCardProps {
    question: Question;
    onAnswer: (selectedOption: string) => void;
    disabled?: boolean;
    showResult?: boolean;
    isCorrect?: boolean;
    selectedAnswer?: string;
}

export default function QuestionCard({
    question,
    onAnswer,
    disabled = false,
    showResult = false,
    isCorrect,
    selectedAnswer
}: QuestionCardProps) {
    const [selected, setSelected] = useState<string | null>(selectedAnswer || null);

    const handleSelect = (option: string) => {
        if (disabled) return;
        setSelected(option);
        onAnswer(option);
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            <Card className="p-8 md:p-10 backdrop-blur-xl bg-slate-900/60 border-slate-800">
                {/* Header Tags */}
                <div className="flex flex-wrap items-center gap-3 mb-8">
                    <Badge variant="purple" icon={<BrainIcon />}>
                        {typeof question.difficulty === 'number'
                            ? `Difficulty: ${(question.difficulty * 100).toFixed(0)}%`
                            : `Difficulty: ${(question.difficulty as string).charAt(0).toUpperCase() + (question.difficulty as string).slice(1)}`
                        }
                    </Badge>
                    {question.topic_tags?.map(tag => (
                        <Badge key={tag} variant="info">{tag}</Badge>
                    ))}
                </div>

                {/* Question Text */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10"
                >
                    <h2 className="text-xl md:text-2xl font-medium text-white leading-relaxed">
                        {question.text}
                    </h2>
                </motion.div>

                {/* Options Grid */}
                <div className="grid grid-cols-1 gap-4">
                    {question.options.map((option, index) => {
                        const isSelected = selected === option;
                        const isCorrectOption = option === question.correct_option;

                        let variant = "default";
                        if (showResult) {
                            if (isCorrectOption) variant = "correct";
                            else if (isSelected && !isCorrect) variant = "wrong";
                            else variant = "dimmed";
                        } else if (isSelected) {
                            variant = "selected";
                        }

                        return (
                            <motion.button
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => handleSelect(option)}
                                disabled={disabled}
                                className={cn(
                                    "relative group p-6 text-left rounded-xl border-2 transition-all duration-200 flex items-center justify-between",
                                    variant === "default" && "border-slate-800 bg-slate-900/50 hover:border-indigo-500/50 hover:bg-slate-800 text-slate-300 hover:text-white",
                                    variant === "selected" && "border-indigo-500 bg-indigo-500/10 text-white shadow-[0_0_15px_rgba(99,102,241,0.2)]",
                                    variant === "correct" && "border-emerald-500 bg-emerald-500/10 text-emerald-400",
                                    variant === "wrong" && "border-rose-500 bg-rose-500/10 text-rose-400",
                                    variant === "dimmed" && "border-slate-800 bg-slate-900/50 opacity-50 cursor-not-allowed"
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors border",
                                        variant === "selected" ? "bg-indigo-500 border-indigo-400 text-white" :
                                            variant === "correct" ? "bg-emerald-500 border-emerald-400 text-white" :
                                                variant === "wrong" ? "bg-rose-500 border-rose-400 text-white" :
                                                    "bg-slate-800 border-slate-700 text-slate-500 group-hover:border-indigo-500 group-hover:text-indigo-400"
                                    )}>
                                        {String.fromCharCode(65 + index)}
                                    </div>
                                    <span className="text-lg">{option}</span>
                                </div>

                                {showResult && isCorrectOption && <CheckCircle2 className="text-emerald-500" />}
                                {showResult && isSelected && !isCorrect && <XCircle className="text-rose-500" />}
                            </motion.button>
                        );
                    })}
                </div>

                {/* Feedback Section */}
                <AnimatePresence>
                    {showResult && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-8 overflow-hidden"
                        >
                            <div className={cn(
                                "p-6 rounded-2xl border flex gap-4",
                                isCorrect
                                    ? "bg-emerald-500/5 border-emerald-500/20"
                                    : "bg-rose-500/5 border-rose-500/20"
                            )}>
                                <div className={cn(
                                    "p-2 rounded-full h-fit",
                                    isCorrect ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                                )}>
                                    {isCorrect ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                                </div>
                                <div className="space-y-2">
                                    <h4 className={cn("font-bold text-lg", isCorrect ? "text-emerald-400" : "text-rose-400")}>
                                        {isCorrect ? "Excellent Work!" : "Not Quite Right"}
                                    </h4>
                                    <p className="text-slate-300 leading-relaxed">
                                        {question.explanation}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Card>
        </div>
    );
}

const BrainIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" /><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" /><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" /></svg>
);
