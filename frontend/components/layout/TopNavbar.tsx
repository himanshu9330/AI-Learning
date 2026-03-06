'use client';

import React from 'react';
import { Bell, Search, Menu } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

const TopNavbar = () => {
    const { user } = useAuth();

    return (
        <header className="h-16 bg-slate-900/50 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-30 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            {/* Mobile Toggle (Hidden for now as Sidebar handles desktop) */}
            <div className="flex items-center gap-4 md:hidden">
                <button className="p-2 text-slate-400 hover:text-white">
                    <Menu className="w-6 h-6" />
                </button>
                <span className="font-bold text-white">Neuromind</span>
            </div>

            {/* Empty Spacer for Desktop Layout Alignment */}
            <div className="hidden md:block w-1"></div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4 sm:gap-6">
                {/* Search (Optional) */}
                <div className="relative hidden sm:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search topics..."
                        className="bg-slate-950 border border-slate-800 rounded-full pl-10 pr-4 py-1.5 text-sm text-slate-300 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all w-64"
                    />
                </div>

                {/* Notifications */}
                <button className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-slate-800">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-slate-900"></span>
                </button>

                {/* User Profile */}
                <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
                    <div className="text-right hidden sm:block">
                        <div className="text-sm font-medium text-white">{user?.name || 'Student'}</div>
                        <div className="text-xs text-slate-500">{user?.target_exam || 'JEE'} Aspirant</div>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-[2px]">
                        <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                            {user?.avatar ? (
                                <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
                            ) : (
                                <span className="font-bold text-indigo-400 text-xs">
                                    {user?.name?.slice(0, 2).toUpperCase() || 'ST'}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export { TopNavbar };
