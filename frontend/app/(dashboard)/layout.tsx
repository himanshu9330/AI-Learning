import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopNavbar } from '@/components/layout/TopNavbar';
import { PageContainer } from '@/components/layout/PageContainer';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-950 flex font-sans text-slate-200 selection:bg-indigo-500/30">
            <Sidebar />
            <div className="flex-1 flex flex-col md:pl-60 transition-all duration-300">
                <TopNavbar />
                <main className="flex-1 relative overflow-y-auto overflow-x-hidden bg-slate-950">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02] pointer-events-none" />
                    {children}
                </main>
            </div>
        </div>
    );
}
