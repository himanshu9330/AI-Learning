'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface TestData {
    test_id: string;
    subject: string;
    final_score: number | null;
    status: 'active' | 'completed' | 'abandoned';
    start_time: string;
    chapter?: string;
    topic?: string;
    questions_attempted: number;
    correct_answers: number;
}

interface RecentActivityProps {
    tests?: TestData[];
    loading?: boolean;
    onTestClick?: (testId: string, status: string) => void;
}

const RecentActivity = ({ tests = [], loading, onTestClick }: RecentActivityProps) => {
    // Helper to safely format date
    const formatTime = (dateStr: string) => {
        try {
            if (!dateStr) return 'recently';
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return 'recently';
            return formatDistanceToNow(date, { addSuffix: true });
        } catch (e) {
            return 'recently';
        }
    };

    return (
        <Card className="p-6 h-full relative overflow-hidden flex flex-col">
            <h3 className="text-xl font-bold text-white mb-6">Recent Activity</h3>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar" style={{ maxHeight: '700px' }}>
                <div className="space-y-8 relative pb-4">
                    {/* Timeline Line */}
                    <div className="absolute left-[19px] top-4 bottom-0 w-[2px] bg-gradient-to-b from-indigo-500/20 via-purple-500/20 to-transparent" />

                    {loading ? (
                        [1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="relative pl-12 flex flex-col gap-2 animate-pulse">
                                <div className="absolute left-0 top-1 w-10 h-10 rounded-full bg-slate-800 border-4 border-slate-950" />
                                <div className="h-4 w-32 bg-slate-800 rounded mt-2" />
                                <div className="h-3 w-48 bg-slate-900 rounded" />
                            </div>
                        ))
                    ) : tests.length > 0 ? (
                        tests.map((test) => {
                            const isCompleted = test.status === 'completed';
                            const score = test.final_score || 0;

                            return (
                                <div
                                    key={test.test_id}
                                    className="relative pl-12 flex flex-col gap-1 cursor-pointer group"
                                    onClick={() => onTestClick?.(test.test_id, test.status)}
                                >
                                    {/* Dot */}
                                    <div className={`absolute left-0 top-2 w-10 h-10 rounded-full border-4 border-slate-900 flex items-center justify-center z-10 
                                        transition-all duration-300 group-hover:scale-110 shadow-lg
                                        ${test.status === 'completed' ? 'bg-emerald-500 text-white shadow-emerald-500/20' :
                                            test.status === 'active' ? 'bg-indigo-500 text-white shadow-indigo-500/20' : 'bg-slate-600 text-white shadow-slate-600/20'}`}
                                    >
                                        {test.status === 'completed' ? <CheckCircle2 size={18} /> :
                                            test.status === 'active' ? <Clock size={18} /> : <XCircle size={18} />}
                                    </div>

                                    <div className="bg-slate-800/20 border border-slate-800/50 group-hover:bg-slate-800/40 group-hover:border-slate-700 rounded-2xl p-4 transition-all duration-300 -mt-2">
                                        <p className="text-base font-semibold text-slate-200 group-hover:text-white transition-colors mb-1">
                                            {test.status === 'completed' ? 'Completed' : 'Resume'} {test.subject} Test
                                        </p>
                                        {(test.chapter || test.topic) && (
                                            <p className="text-sm text-indigo-400/90 font-medium mb-2">
                                                {test.chapter}{test.topic ? ` • ${test.topic}` : ''}
                                            </p>
                                        )}
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 font-medium">
                                            <span className="flex items-center gap-1"><Clock size={12} className="opacity-70" /> {formatTime(test.start_time)}</span>
                                            {isCompleted && (
                                                <>
                                                    <span className="w-1 h-1 rounded-full bg-slate-600" />
                                                    <span className={score >= 60 ? 'text-emerald-400' : 'text-rose-400'}>
                                                        {test.correct_answers}/{test.questions_attempted} Correct
                                                    </span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-600" />
                                                    <span className={`px-2 py-0.5 rounded-full ${score >= 60 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                                        {score}% Score
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="h-[200px] flex flex-col items-center justify-center text-center space-y-3 mt-8">
                            <div className="w-16 h-16 rounded-full bg-slate-800/60 border border-slate-700/50 flex items-center justify-center shadow-lg">
                                <Clock className="w-8 h-8 text-slate-500" />
                            </div>
                            <p className="text-sm text-slate-400 max-w-[200px] leading-relaxed">No recent activity found. Start a new test to see your history here.</p>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};

export { RecentActivity };
