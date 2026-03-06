'use client';

import React from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Moon, Bell, Shield, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function SettingsPage() {
    const { logout } = useAuth();

    return (
        <PageContainer>
            <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>

            <div className="max-w-2xl space-y-6">
                <Card className="p-0 overflow-hidden">
                    <div className="p-6 border-b border-slate-800">
                        <h3 className="font-bold text-white">Preferences</h3>
                    </div>
                    <div className="divide-y divide-slate-800">
                        <div className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
                            <div className="flex items-center gap-3">
                                <Moon className="w-5 h-5 text-slate-400" />
                                <span className="text-slate-300">Dark Mode</span>
                            </div>
                            {/* Toggle switch placeholder */}
                            <div className="w-10 h-5 bg-indigo-600 rounded-full relative"><div className="w-3 h-3 bg-white rounded-full absolute right-1 top-1" /></div>
                        </div>
                        <div className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
                            <div className="flex items-center gap-3">
                                <Bell className="w-5 h-5 text-slate-400" />
                                <span className="text-slate-300">Notifications</span>
                            </div>
                            <div className="w-10 h-5 bg-slate-700 rounded-full relative"><div className="w-3 h-3 bg-white rounded-full absolute left-1 top-1" /></div>
                        </div>
                    </div>
                </Card>

                <Card className="p-0 overflow-hidden">
                    <div className="p-6 border-b border-slate-800">
                        <h3 className="font-bold text-white">Account</h3>
                    </div>
                    <div className="divide-y divide-slate-800">
                        <div className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
                            <div className="flex items-center gap-3">
                                <Shield className="w-5 h-5 text-slate-400" />
                                <span className="text-slate-300">Privacy & Security</span>
                            </div>
                        </div>
                        <div className="p-4 flex items-center justify-between hover:bg-rose-500/10 transition-colors cursor-pointer" onClick={() => logout()}>
                            <div className="flex items-center gap-3">
                                <LogOut className="w-5 h-5 text-rose-400" />
                                <span className="text-rose-400 font-medium">Sign Out</span>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </PageContainer>
    );
}
