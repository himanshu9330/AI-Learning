'use client';

import React, { useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { SubjectSelection } from '@/components/test/SubjectSelection';
import { ExamCategory, Stream, SubjectConfig } from '@/config/examConfig';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function SelectSubjectPage() {
    const [selectedExam, setSelectedExam] = useState<ExamCategory>('JEE');
    const [selectedStream, setSelectedStream] = useState<Stream>('NONE');
    const [selectedSubject, setSelectedSubject] = useState<string | undefined>();

    const handleExamChange = (exam: ExamCategory) => {
        setSelectedExam(exam);
        setSelectedSubject(undefined);
        // Reset stream if not Class 12
        if (exam !== 'CLASS_12') {
            setSelectedStream('NONE');
        } else {
            setSelectedStream('SCIENCE_MATH');
        }
    };

    const handleSubjectSelect = (subject: SubjectConfig) => {
        setSelectedSubject(subject.id);
        toast.success(`Selected ${subject.name} for ${selectedExam}`);
    };

    const exams: { label: string; value: ExamCategory }[] = [
        { label: 'JEE', value: 'JEE' },
        { label: 'NEET', value: 'NEET' },
        { label: 'Class 12', value: 'CLASS_12' },
        { label: 'Others', value: 'OTHER' },
    ];

    return (
        <PageContainer>
            <div className="max-w-5xl mx-auto space-y-12 pb-20">
                {/* Demo Controls */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl shadow-2xl"
                >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-4">
                            <label className="text-sm font-medium text-slate-400 uppercase tracking-wider">Select Exam Category</label>
                            <div className="flex flex-wrap gap-3">
                                {exams.map((exam) => (
                                    <Button
                                        key={exam.value}
                                        variant={selectedExam === exam.value ? 'gradient' : 'outline'}
                                        onClick={() => handleExamChange(exam.value)}
                                        className="px-6 rounded-full"
                                    >
                                        {exam.label}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {selectedExam === 'CLASS_12' && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-4"
                            >
                                <label className="text-sm font-medium text-slate-400 uppercase tracking-wider">Choose Stream</label>
                                <div className="flex gap-3">
                                    <Button
                                        variant={selectedStream === 'SCIENCE_MATH' ? 'primary' : 'outline'}
                                        onClick={() => setSelectedStream('SCIENCE_MATH')}
                                        size="sm"
                                        className="rounded-full"
                                    >
                                        Science (Math)
                                    </Button>
                                    <Button
                                        variant={selectedStream === 'SCIENCE_BIO' ? 'primary' : 'outline'}
                                        onClick={() => setSelectedStream('SCIENCE_BIO')}
                                        size="sm"
                                        className="rounded-full"
                                    >
                                        Science (Bio)
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </motion.div>

                {/* Dynamic Component */}
                <SubjectSelection
                    exam={selectedExam}
                    stream={selectedStream}
                    selectedSubjectId={selectedSubject}
                    onSelect={handleSubjectSelect}
                />

                {/* Status Bar */}
                {selectedSubject && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-lg px-4"
                    >
                        <div className="p-4 rounded-2xl bg-indigo-600 shadow-2xl shadow-indigo-500/40 flex items-center justify-between">
                            <p className="text-white font-medium">Continue with {selectedSubject.charAt(0).toUpperCase() + selectedSubject.slice(1)}?</p>
                            <Button size="sm" variant="secondary" className="bg-white text-indigo-600 hover:bg-slate-100">
                                Next Step
                            </Button>
                        </div>
                    </motion.div>
                )}
            </div>
        </PageContainer>
    );
}
