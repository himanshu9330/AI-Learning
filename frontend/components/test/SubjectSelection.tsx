'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import {
    getSubjectsForExam,
    ExamCategory,
    Stream,
    SubjectConfig
} from '@/config/examConfig';
import * as Icons from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming this utility exists for tailwind classes

interface SubjectSelectionProps {
    exam: ExamCategory;
    stream?: Stream;
    onSelect?: (subject: SubjectConfig) => void;
    selectedSubjectId?: string;
    className?: string;
}

/**
 * Dynamically renders subjects based on exam configuration
 */
export const SubjectSelection: React.FC<SubjectSelectionProps> = ({
    exam,
    stream = 'NONE',
    onSelect,
    selectedSubjectId,
    className
}) => {
    const subjects = getSubjectsForExam(exam, stream);

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        show: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                type: 'spring',
                stiffness: 300,
                damping: 24
            }
        },
        hover: {
            y: -8,
            transition: { duration: 0.2 }
        },
        tap: { scale: 0.98 }
    };

    return (
        <div className={cn("w-full py-8", className)}>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Select Your Subject</h2>
                <p className="text-slate-400">Choose a subject to start your adaptive learning journey for {exam.replace('_', ' ')}.</p>
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
                <AnimatePresence mode="popLayout">
                    {subjects.map((subject) => {
                        // Dynamic icon component lookup
                        // @ts-ignore - Dynamic key access
                        const IconComponent = Icons[subject.icon] || Icons.BookOpen;
                        const isSelected = selectedSubjectId === subject.id;

                        return (
                            <motion.div
                                key={`${exam}-${stream}-${subject.id}`}
                                variants={cardVariants}
                                whileHover="hover"
                                whileTap="tap"
                                layout
                                onClick={() => onSelect?.(subject)}
                                className="cursor-pointer"
                            >
                                <Card className={cn(
                                    "relative h-48 overflow-hidden group transition-all duration-300",
                                    isSelected
                                        ? "border-indigo-500 ring-2 ring-indigo-500/20"
                                        : "border-slate-800 hover:border-slate-700 bg-slate-900/40"
                                )}>
                                    {/* Background Gradient */}
                                    <div className={cn(
                                        "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br",
                                        subject.color
                                    )} />

                                    <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
                                        <div className={cn(
                                            "w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-lg mb-4",
                                            subject.color
                                        )}>
                                            <IconComponent className="w-6 h-6 text-white" />
                                        </div>

                                        <div>
                                            <h3 className="text-xl font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">
                                                {subject.name}
                                            </h3>
                                            <div className="flex items-center text-slate-400 text-sm">
                                                <span>Adaptive Roadmap Available</span>
                                                <Icons.ChevronRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Selection Indicator */}
                                    {isSelected && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute top-4 right-4 w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center shadow-lg"
                                        >
                                            <Icons.Check className="w-4 h-4 text-white" />
                                        </motion.div>
                                    )}
                                </Card>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </motion.div>

            {subjects.length === 0 && (
                <div className="text-center py-20 bg-slate-900/20 rounded-3xl border border-dashed border-slate-800">
                    <Icons.SearchX className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-400">No subjects found for this configuration.</h3>
                </div>
            )}
        </div>
    );
};
