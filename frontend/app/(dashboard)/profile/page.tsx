'use client';

import React from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { User, Settings, Award } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfilePage() {
    const { user } = useAuth();

    return (
        <PageContainer>
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 p-[2px]">
                        <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                            {user?.avatar ? (
                                <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-2xl font-bold text-white">
                                    {user?.name?.slice(0, 2).toUpperCase() || 'ST'}
                                </span>
                            )}
                        </div>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">{user?.name || 'Student'}</h1>
                        <p className="text-slate-400">{user?.email}</p>
                        <div className="flex gap-2 mt-2">
                            <Badge variant="purple">{user?.target_exam || 'JEE'} Aspirant</Badge>
                            <Badge variant="success">Pro Member</Badge>
                        </div>
                    </div>
                </div>

                <Card className="p-6">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                        <Award className="w-5 h-5 text-indigo-400" />
                        Achievements
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="aspect-square rounded-xl bg-slate-800/50 border border-slate-800 flex flex-col items-center justify-center text-center p-2 opacity-50 grayscale">
                                <div className="w-10 h-10 rounded-full bg-slate-700 mb-2" />
                                <span className="text-xs text-slate-500 font-bold">Locked</span>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Just a placeholder for settings redirect or basic info */}
                <div className="flex justify-end">
                    <Button variant="secondary" leftIcon={<Settings size={16} />}>Edit Profile</Button>
                </div>
            </div>
        </PageContainer>
    );
}
