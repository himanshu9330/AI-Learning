'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    BookOpen,
    LineChart,
    Map,
    User,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Brain,
    Calendar as CalendarIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const Sidebar = () => {
    const [collapsed, setCollapsed] = useState(false);
    const pathname = usePathname();
    const { logout } = useAuth();

    const links = [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/timetable', label: 'Timetable', icon: CalendarIcon },
        { href: '/test', label: 'Test Runner', icon: BookOpen },
        { href: '/analytics', label: 'Analytics', icon: LineChart },
        { href: '/roadmap', label: 'Roadmap', icon: Map },
        { href: '/profile', label: 'Profile', icon: User },
        { href: '/settings', label: 'Settings', icon: Settings },
    ];

    return (
        <motion.aside
            initial={{ width: 240 }}
            animate={{ width: collapsed ? 80 : 240 }}
            className="fixed left-0 top-0 h-screen bg-slate-900 border-r border-slate-800 z-40 hidden md:flex flex-col transition-all duration-300"
        >
            {/* Logo */}
            <div className="h-16 flex items-center px-6 border-b border-slate-800">
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg shrink-0">
                        <Brain className="w-5 h-5 text-white" />
                    </div>
                    {!collapsed && (
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 whitespace-nowrap"
                        >
                            Neuromind
                        </motion.span>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto overflow-x-hidden">
                {links.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative",
                                isActive
                                    ? "bg-indigo-500/10 text-indigo-400"
                                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
                            )}
                        >
                            <link.icon className={cn("w-5 h-5 shrink-0", isActive && "text-indigo-400")} />
                            {!collapsed && (
                                <span className="font-medium truncate">{link.label}</span>
                            )}
                            {/* Active Indicator */}
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute left-0 top-0 w-1 h-full bg-indigo-500 rounded-r-full"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer / Toggle */}
            <div className="p-3 border-t border-slate-800">
                <button
                    onClick={() => logout()}
                    className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors mb-2"
                    )}
                >
                    <LogOut className="w-5 h-5 shrink-0" />
                    {!collapsed && <span className="font-medium">Sign Out</span>}
                </button>

                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-slate-800 text-slate-500 transition-colors"
                >
                    {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
            </div>
        </motion.aside>
    );
};

export { Sidebar };
