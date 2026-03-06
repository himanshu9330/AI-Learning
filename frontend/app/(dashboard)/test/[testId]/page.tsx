'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowRight, Brain, Sparkles, Clock, LogOut,
    CheckCircle2, XCircle, AlertCircle, Zap
} from 'lucide-react';
import QuestionCard from '@/components/QuestionCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import ExplanationModal from '@/components/ExplanationModal';
import testService, { TestSession, Question, AIExplanationResponse } from '@/services/testService';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import AIExplanationView from '@/components/AIExplanationView';

// Inline timer that resets for each question
// ... (rest of the file until TestRunnerPage state)

// Inline timer that resets for each question
function QuestionTimer({ running }: { running: boolean }) {
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        setSeconds(0);
    }, [running]);

    useEffect(() => {
        if (!running) return;
        const id = setInterval(() => setSeconds(s => s + 1), 1000);
        return () => clearInterval(id);
    }, [running]);

    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const isWarning = seconds > 60;

    return (
        <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono font-bold text-sm tabular-nums transition-colors",
            isWarning
                ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                : "bg-slate-800/80 border-slate-700 text-slate-200"
        )}>
            <Clock size={14} className={isWarning ? "animate-pulse" : ""} />
            {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </div>
    );
}

// Session-wide elapsed timer
function SessionTimer() {
    const [seconds, setSeconds] = useState(0);
    useEffect(() => {
        const id = setInterval(() => setSeconds(s => s + 1), 1000);
        return () => clearInterval(id);
    }, []);
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return (
        <span className="font-mono tabular-nums text-slate-300 text-sm">
            {h > 0 && `${String(h).padStart(2, '0')}:`}
            {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
        </span>
    );
}

export default function TestRunnerPage() {
    const params = useParams();
    const router = useRouter();

    const [session, setSession] = useState<TestSession | null>(null);
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [loading, setLoading] = useState(true);
    const [answering, setAnswering] = useState(false);

    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [explanation, setExplanation] = useState<string | null>(null);

    const [promoted, setPromoted] = useState(false);
    const [terminated, setTerminated] = useState(false);
    const [questionTimerRunning, setQuestionTimerRunning] = useState(false);

    const [showExplanation, setShowExplanation] = useState(false);
    const [aiExplanationData, setAiExplanationData] = useState<AIExplanationResponse['data'] | null>(null);
    const [loadingAI, setLoadingAI] = useState(false);
    const [questionNumber, setQuestionNumber] = useState(1);

    const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());

    const initTest = useCallback(async () => {
        if (!params.testId) return;

        try {
            setLoading(true);
            // 1. Fetch specific session by ID to ensure subject correctness
            const sessionRes = await testService.getSessionByTestId(params.testId as string);
            const sessionData = sessionRes.data;

            // 2. Load/Start the test question for this session
            // startTest on backend handles resuming or creating the first question for this subject
            const startRes = await testService.startTest(
                sessionData.subject,
                sessionData.chapter || undefined,
                sessionData.topic || undefined
            );

            // Note: startTest returns the "active" session for that subject.
            // Because we deactivated others in the backend startTest fix, this is now safe.
            setSession(startRes.data.session);
            setCurrentQuestion(startRes.data.question);
            setQuestionTimerRunning(true);
            setQuestionStartTime(Date.now());
        } catch (error) {
            console.error('Failed to init test', error);
            toast.error('Unable to load this test session');
            router.push('/test');
        } finally {
            setLoading(false);
        }
    }, [params.testId, router]);

    useEffect(() => {
        initTest();
    }, [initTest]);

    const fetchNextQuestion = async () => {
        try {
            setLoading(true);
            setShowResult(false);
            setSelectedOption(null);
            setPromoted(false);
            setExplanation(null);
            setAiExplanationData(null);
            const response = await testService.getNextQuestion(params.testId as string);
            setCurrentQuestion(response.data);
            setQuestionNumber(q => q + 1);
            setQuestionTimerRunning(true);
            setQuestionStartTime(Date.now());
        } catch (error) {
            toast.error('No more questions available');
            router.push('/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handleOptionSelect = (option: string) => {
        if (answering || showResult) return;
        setSelectedOption(option);
    };

    const handleSubmitAnswer = async () => {
        if (!selectedOption || answering || showResult || !currentQuestion) return;
        setAnswering(true);
        setQuestionTimerRunning(false);

        const timeTaken = Date.now() - questionStartTime;

        try {
            const response = await testService.submitAnswer(
                currentQuestion.id,
                selectedOption,
                timeTaken,
                params.testId as string
            );
            const result = response.data;
            setIsCorrect(result.isCorrect);
            setExplanation(result.explanation);
            if (session) {
                setSession({ ...session, batchCount: result.batchProgress, currentLevel: result.currentLevel });
            }
            if (result.evalResult?.promoted) {
                setPromoted(true);
                toast.success('🎉 Level Up! Great work!', { duration: 3000 });
            }
            if (result.evalResult?.terminated) {
                setTerminated(true);
            }
            setShowResult(true);
        } catch (error) {
            toast.error('Failed to submit answer');
            setQuestionTimerRunning(true);
        } finally {
            setAnswering(false);
        }
    };

    const handleShowAIExplanation = async () => {
        if (!currentQuestion || !selectedOption) return;

        // If already loaded, just show it
        if (aiExplanationData) {
            setShowExplanation(true);
            return;
        }

        try {
            setLoadingAI(true);
            const response = await testService.getAIExplanation({
                question_id: currentQuestion.id,
                student_answer: selectedOption,
                exam: session?.exam,
                mastery_level: session?.currentLevel ? session.currentLevel / 5 : 0.5
            });
            setAiExplanationData(response.data);
            setShowExplanation(true);
        } catch (error) {
            toast.error('Failed to get AI explanation');
        } finally {
            setLoadingAI(false);
        }
    };

    const handleNext = () => {
        if (terminated) {
            router.push('/dashboard');
        } else {
            fetchNextQuestion();
        }
    };

    // Loading state
    if (loading && !session) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 gap-4">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-400 text-sm animate-pulse">Loading your test...</p>
            </div>
        );
    }

    if (!session || !currentQuestion) return null;

    const batchTotal = session.batchTotal || 5;
    const batchCount = session.batchCount || 0;
    const progressPct = Math.min((batchCount / batchTotal) * 100, 100);

    const levelColors: Record<number, string> = {
        1: 'text-emerald-400',
        2: 'text-cyan-400',
        3: 'text-indigo-400',
        4: 'text-purple-400',
        5: 'text-rose-400',
    };
    const levelColor = levelColors[session.currentLevel] || 'text-indigo-400';

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col overflow-hidden">

            {/* ── TOP NAVBAR ──────────────────────────────────────── */}
            <header className="shrink-0 h-14 bg-slate-900 border-b border-slate-800 z-50 flex items-center">
                <div className="w-full px-4 sm:px-6 flex items-center justify-between gap-4">

                    {/* LEFT: Brand + Exam + Subject */}
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                            <Brain size={16} className="text-indigo-400" />
                        </div>
                        <div className="hidden sm:flex flex-col leading-none min-w-0">
                            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                                {session.exam?.toUpperCase() ?? 'EXAM'}
                            </span>
                            <span className="text-sm font-bold text-white truncate">
                                {session.subject}
                            </span>
                        </div>
                        <div className="hidden sm:block h-6 w-px bg-slate-700" />
                        {/* Level badge */}
                        <div className={cn("flex items-center gap-1.5 text-xs font-bold", levelColor)}>
                            <Zap size={14} />
                            <span>Level {session.currentLevel}</span>
                        </div>
                    </div>

                    {/* CENTER: Session Timer */}
                    <div className="flex items-center gap-1.5 text-slate-400">
                        <Clock size={14} />
                        <SessionTimer />
                    </div>

                    {/* RIGHT: Question timer + Exit */}
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        <QuestionTimer running={questionTimerRunning && !showResult} />
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push('/dashboard')}
                            className="hidden sm:flex items-center gap-1.5 text-slate-400 hover:text-white"
                        >
                            <LogOut size={14} />
                            <span>Exit</span>
                        </Button>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="sm:hidden p-1.5 rounded-lg hover:bg-slate-800 text-slate-400"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>

                {/* Progress bar at very bottom of header */}
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-800">
                    <motion.div
                        className={cn("h-full", promoted ? "bg-emerald-500" : "bg-indigo-500")}
                        initial={false}
                        animate={{ width: `${progressPct}%` }}
                        transition={{ duration: 0.4 }}
                    />
                </div>
            </header>

            {/* ── BATCH PROGRESS DOTS ─────────────────────────────── */}
            <div className="shrink-0 bg-slate-900/50 border-b border-slate-800/50 py-2 px-4 flex items-center justify-center gap-2">
                <span className="text-xs text-slate-500 mr-1">Batch:</span>
                {Array.from({ length: batchTotal }).map((_, i) => (
                    <div
                        key={i}
                        className={cn(
                            "h-2 rounded-full transition-all duration-300",
                            i < batchCount
                                ? (promoted ? "w-6 bg-emerald-500" : "w-6 bg-indigo-500")
                                : "w-2 bg-slate-700"
                        )}
                    />
                ))}
                <span className="text-xs text-slate-500 ml-1">{batchCount}/{batchTotal}</span>
            </div>

            {/* ── MAIN SCROLLABLE CONTENT ─────────────────────────── */}
            <main className="flex-1 overflow-y-auto">
                <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

                    {/* Banners */}
                    <AnimatePresence>
                        {promoted && (
                            <motion.div
                                key="promoted-banner"
                                initial={{ opacity: 0, y: -10, scale: 0.97 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.97 }}
                                className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold"
                            >
                                <Sparkles size={18} />
                                <div>
                                    <p className="font-bold">Level Up!</p>
                                    <p className="text-sm text-emerald-400/70">Difficulty increased to Level {session.currentLevel}</p>
                                </div>
                            </motion.div>
                        )}
                        {terminated && (
                            <motion.div
                                key="terminated-banner"
                                initial={{ opacity: 0, y: -10, scale: 0.97 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className="flex items-center gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 font-semibold"
                            >
                                <AlertCircle size={18} />
                                <div>
                                    <p className="font-bold">Session Complete</p>
                                    <p className="text-sm text-rose-400/70">Keep practicing to improve your level!</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Question meta row */}
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500 font-medium">
                            Question #{questionNumber}
                        </span>
                        <div className="flex items-center gap-2">
                            {currentQuestion.topic_tags?.map(tag => (
                                <Badge key={tag} variant="info" className="text-[10px] py-0">{tag}</Badge>
                            ))}
                            <Badge variant="purple" className="text-[10px] py-0">
                                {currentQuestion.chapter || 'General'}
                            </Badge>
                        </div>
                    </div>

                    {/* Loading overlay for next question */}
                    <AnimatePresence>
                        {loading && (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center justify-center py-20"
                            >
                                <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Question Card */}
                    {!loading && (
                        <motion.div
                            key={currentQuestion.id}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.25 }}
                        >
                            <QuestionCard
                                question={{ ...currentQuestion, explanation: explanation || undefined }}
                                onAnswer={handleOptionSelect}
                                disabled={answering || showResult}
                                showResult={showResult}
                                isCorrect={isCorrect}
                                selectedAnswer={selectedOption || undefined}
                            />
                        </motion.div>
                    )}

                    {/* ── ACTION AREA ─────────────────────────────────── */}
                    {!loading && (
                        <AnimatePresence mode="wait">
                            {!showResult ? (
                                /* Submit button */
                                <motion.div
                                    key="submit"
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    className="flex justify-end"
                                >
                                    <Button
                                        size="lg"
                                        variant={selectedOption ? "gradient" : "secondary"}
                                        onClick={handleSubmitAnswer}
                                        disabled={!selectedOption || answering}
                                        isLoading={answering}
                                        className="px-10 min-w-[160px]"
                                    >
                                        {answering ? 'Checking...' : 'Submit Answer'}
                                    </Button>
                                </motion.div>
                            ) : (
                                /* Post-answer actions */
                                <motion.div
                                    key="next"
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-800"
                                >
                                    {/* Left side: result badge + explanation */}
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm",
                                            isCorrect
                                                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                                                : "bg-rose-500/10 border border-rose-500/20 text-rose-400"
                                        )}>
                                            {isCorrect
                                                ? <><CheckCircle2 size={16} /> Correct!</>
                                                : <><XCircle size={16} /> Incorrect</>
                                            }
                                        </div>
                                        {!isCorrect && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleShowAIExplanation}
                                                isLoading={loadingAI}
                                                className="text-xs text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/5 flex items-center gap-1.5"
                                            >
                                                <Sparkles size={14} />
                                                <span>AI Explanation</span>
                                            </Button>
                                        )}
                                    </div>

                                    {/* Right side: next button */}
                                    <Button
                                        size="lg"
                                        variant={terminated ? "danger" : (promoted ? "primary" : "gradient")}
                                        onClick={handleNext}
                                        rightIcon={!terminated && <ArrowRight size={16} />}
                                        className="sm:min-w-[160px]"
                                    >
                                        {terminated ? 'View Results' : promoted ? '🚀 Next Level' : 'Next Question'}
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    )}

                </div>
            </main>

            {/* AI Explanation Overlay */}
            <AnimatePresence>
                {showExplanation && aiExplanationData && (
                    <AIExplanationView
                        data={aiExplanationData}
                        onClose={() => setShowExplanation(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
