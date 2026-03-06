'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, FlaskConical, Brain, BookOpen, Globe, ArrowRight, Sparkles } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import testService from '@/services/testService';

const subjects = [
    {
        id: 'math',
        name: 'Mathematics',
        icon: Calculator,
        gradient: 'from-blue-500 to-cyan-500',
        description: 'Master Algebra, Calculus, and Geometry through adaptive problems.',
        topics: ['Calculus', 'Algebra', 'Vectors']
    },
    {
        id: 'physics',
        name: 'Physics',
        icon: FlaskConical,
        gradient: 'from-violet-500 to-purple-500',
        description: 'Explore Mechanics, Thermodynamics, and Electromagnetism.',
        topics: ['Mechanics', 'Optics', 'Thermodynamics']
    },
    {
        id: 'chemistry',
        name: 'Chemistry',
        icon: Brain,
        gradient: 'from-emerald-500 to-teal-500',
        description: 'Understand Organic, Inorganic, and Physical Chemistry concepts.',
        topics: ['Organic', 'Inorganic', 'Physical']
    },
    {
        id: 'biology',
        name: 'Biology',
        icon: BookOpen,
        gradient: 'from-rose-500 to-pink-500',
        description: 'Dive into Botany, Zoology, and Genetics.',
        topics: ['Genetics', 'Botany', 'Zoology']
    }
];

const SubjectCard = ({ subject, loading, onStart }: { subject: any, loading: string | null, onStart: (name: string) => void }) => (
    <Card
        className="group relative h-full flex flex-col overflow-hidden cursor-pointer hover:border-slate-600 transition-colors"
        onClick={() => !loading && onStart(subject.name)}
    >
        {/* Background Gradient Hover */}
        <div className={`absolute inset-0 bg-gradient-to-br ${subject.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

        <div className="p-8 flex-1 flex flex-col">
            <div className="flex items-start justify-between mb-6">
                <div className={`p-3 rounded-2xl bg-gradient-to-br ${subject.gradient} shadow-lg shadow-black/20 group-hover:scale-110 transition-transform duration-300`}>
                    <subject.icon className="w-8 h-8 text-white" />
                </div>
                <div className="p-2 rounded-full bg-slate-800/50 text-slate-400 group-hover:text-white group-hover:bg-slate-800 transition-colors">
                    <ArrowRight className="w-5 h-5 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                </div>
            </div>

            <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-br group-hover:from-white group-hover:to-slate-300 transition-all">
                {subject.name}
            </h3>
            <p className="text-slate-400 mb-6 flex-1 text-sm leading-relaxed">
                {subject.description}
            </p>

            {/* Topics Tags */}
            <div className="flex flex-wrap gap-2">
                {subject.topics.map((topic: string) => (
                    <span key={topic} className="text-xs px-2 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-400">
                        {topic}
                    </span>
                ))}
            </div>
        </div>

        {loading === subject.name && (
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        )}
    </Card>
);

export default function TestSelectionPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAuth();
    const [loading, setLoading] = useState<string | null>(null);
    const [metadata, setMetadata] = useState<any>(null);
    const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
    const [selectedChapter, setSelectedChapter] = useState<string>('');
    const [selectedTopic, setSelectedTopic] = useState<string>('');

    useEffect(() => {
        checkActiveSession();
        fetchMetadata();
    }, []);

    // Effect to handle query params after metadata is loaded
    useEffect(() => {
        if (metadata) {
            const subjectParam = searchParams.get('subject');
            const chapterParam = searchParams.get('chapter');
            const topicParam = searchParams.get('topic');

            if (subjectParam) {
                const subject = subjects.find(s => s.name.toLowerCase() === subjectParam.toLowerCase()) ||
                    (metadata[user?.target_exam?.toUpperCase() || 'JEE']?.[subjectParam]);

                if (subject) {
                    setSelectedSubject(subject.name || subjectParam);
                    if (chapterParam) setSelectedChapter(chapterParam);
                    if (topicParam) setSelectedTopic(topicParam);
                }
            }
        }
    }, [metadata, searchParams, user?.target_exam]);

    const fetchMetadata = async () => {
        try {
            const response = await testService.getMetadata();
            setMetadata(response.data);
        } catch (error) {
            console.error('Failed to fetch metadata');
        }
    };

    const checkActiveSession = async () => {
        try {
            const response = await testService.resumeSession();
            if (response.data.session) {
                const session = response.data.session;
                toast((t) => (
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <p className="font-bold text-sm">Active Session Found</p>
                            <p className="text-xs text-slate-500">Continue your {session.subject} test?</p>
                        </div>
                        <div className="flex gap-2">
                            <Button size="sm" variant="ghost" onClick={() => toast.dismiss(t.id)}>Ignore</Button>
                            <Button size="sm" variant="primary" onClick={() => {
                                toast.dismiss(t.id);
                                router.push(`/test/${session.test_id}`);
                            }}>Resume</Button>
                        </div>
                    </div>
                ), { duration: 6000, position: 'bottom-right', style: { background: '#0f172a', border: '1px solid #1e293b', color: '#fff' } });
            }
        } catch (error) {
            console.error('Session check failed');
        }
    };

    // Filter subjects based on target exam
    const filteredSubjectsList = subjects.filter(subject => {
        const target = user?.target_exam || 'JEE';

        if (target === 'NEET') {
            return subject.id !== 'math';
        }

        if (target === 'JEE' || target === 'BITSAT') {
            return subject.id !== 'biology';
        }

        return true;
    });

    const handleSubjectClick = (subjectName: string) => {
        if (selectedSubject === subjectName) {
            setSelectedSubject(null);
            setSelectedChapter('');
            setSelectedTopic('');
        } else {
            setSelectedSubject(subjectName);
            setSelectedChapter('');
            setSelectedTopic('');
        }
    };

    const startTest = async () => {
        if (!selectedSubject) return;

        setLoading(selectedSubject);
        try {
            const response = await testService.startTest(
                selectedSubject,
                selectedChapter || undefined,
                selectedTopic || undefined
            );
            const testId = response.data.session.test_id;
            router.push(`/test/${testId}`);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to start test');
            setLoading(null);
        }
    };

    const examKey = (user?.target_exam || 'JEE').toUpperCase();
    const currentSubjectMetadata = metadata && selectedSubject ? metadata[examKey]?.[selectedSubject] : null;

    return (
        <PageContainer>
            <div className="max-w-5xl mx-auto space-y-12">
                {/* Header */}
                <div className="text-center space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium"
                    >
                        <Sparkles className="w-4 h-4" />
                        <span>AI-Adaptive Testing</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-bold text-white max-w-2xl mx-auto"
                    >
                        {selectedSubject ? `Master ${selectedSubject}` : 'Choose your arena for'} <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                            {selectedSubject ? 'Step by Step' : 'Mastery'}
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-slate-400 max-w-xl mx-auto"
                    >
                        {selectedSubject
                            ? "Customize your session by selecting a specific chapter or topic, or jump straight into a full subject test."
                            : "Select a subject to begin a personalized session. Our AI will adjust difficulty in real-time based on your performance."
                        }
                    </motion.p>
                </div>

                {/* Selection UI */}
                <AnimatePresence mode="wait">
                    {!selectedSubject ? (
                        <motion.div
                            key="subjects"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-12"
                        >
                            {/* Core Subjects Section */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="h-px flex-1 bg-slate-800" />
                                    <h2 className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em]">Core Excellence</h2>
                                    <div className="h-px flex-1 bg-slate-800" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {filteredSubjectsList.filter(s => ['physics', 'chemistry'].includes(s.id)).map((subject, index) => (
                                        <motion.div
                                            key={subject.id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.1 * index }}
                                        >
                                            <SubjectCard subject={subject} loading={loading} onStart={handleSubjectClick} />
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Specialization Section */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="h-px flex-1 bg-slate-800" />
                                    <h2 className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em]">Stream Specialization</h2>
                                    <div className="h-px flex-1 bg-slate-800" />
                                </div>
                                <div className="max-w-2xl mx-auto">
                                    {filteredSubjectsList.filter(s => ['math', 'biology'].includes(s.id)).map((subject) => (
                                        <motion.div
                                            key={subject.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 }}
                                        >
                                            <SubjectCard subject={subject} loading={loading} onStart={handleSubjectClick} />
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="configuration"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="max-w-2xl mx-auto"
                        >
                            <Card className="p-8 space-y-8 bg-slate-900/50 backdrop-blur-xl border-slate-800 shadow-2xl">
                                <div className="flex items-center gap-4 mb-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSelectedSubject(null)}
                                        className="text-slate-400 hover:text-white"
                                    >
                                        <ArrowRight className="w-4 h-4 rotate-180 mr-2" />
                                        Back
                                    </Button>
                                    <div className="h-8 w-[1px] bg-slate-800" />
                                    <h3 className="text-xl font-bold text-white">{selectedSubject} Configuration</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <label className="text-sm font-bold text-slate-500 uppercase tracking-wider block">Specific Chapter</label>
                                        <select
                                            value={selectedChapter}
                                            onChange={(e) => setSelectedChapter(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
                                        >
                                            <option value="">All Chapters (Recommended)</option>
                                            {currentSubjectMetadata?.chapters.map((chapter: string) => (
                                                <option key={chapter} value={chapter}>{chapter}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-sm font-bold text-slate-500 uppercase tracking-wider block">Target Topic</label>
                                        <select
                                            value={selectedTopic}
                                            onChange={(e) => setSelectedTopic(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
                                        >
                                            <option value="">All Topics</option>
                                            {currentSubjectMetadata?.topics.map((topic: string) => (
                                                <option key={topic} value={topic}>{topic}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="pt-4 flex flex-col sm:flex-row gap-4">
                                    <Button
                                        variant="primary"
                                        size="lg"
                                        className="flex-1 py-6 text-lg font-bold shadow-lg shadow-indigo-500/20"
                                        onClick={startTest}
                                        isLoading={!!loading}
                                        rightIcon={<ArrowRight className="w-5 h-5" />}
                                    >
                                        Launch Session
                                    </Button>
                                </div>

                                <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 flex gap-4 items-start">
                                    <Sparkles className="w-5 h-5 text-indigo-400 mt-0.5" />
                                    <p className="text-xs text-slate-400 leading-relaxed">
                                        Our AI will prioritize questions from your selected {selectedChapter ? "chapter" : "subject"}.
                                        Difficulty will adapt dynamically based on your previous performance in these topics.
                                    </p>
                                </div>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </PageContainer>
    );
}
