'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import authService from '@/services/authService';

export default function RegisterPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading: authLoading, register } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        grade: '12th',
        target_exam: 'JEE'
    });

    React.useEffect(() => {
        if (!authLoading && isAuthenticated) {
            router.push('/dashboard');
        }
    }, [isAuthenticated, authLoading, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await register(formData);
            toast.success('Registration successful!');
            router.push('/dashboard');
        } catch (error: any) {
            console.error('Registration error:', error);
            const backendErrors = error.response?.data?.errors;
            if (backendErrors && Array.isArray(backendErrors)) {
                backendErrors.forEach((err: any) => {
                    toast.error(err.message || 'Validation failed');
                });
            } else {
                toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (authLoading || isAuthenticated) {
        return <div className="min-h-screen flex items-center justify-center bg-slate-950">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card className="p-8 backdrop-blur-xl bg-slate-900/40 border-slate-800 shadow-2xl max-w-md mx-auto w-full">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
                    <p className="text-slate-400">Join Neuromind to start learning</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
                        <input
                            type="email"
                            required
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Grade</label>
                            <select
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                                value={formData.grade}
                                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                            >
                                <option value="11th">11th</option>
                                <option value="12th">12th</option>
                                <option value="Dropper">Dropper</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Target Exam</label>
                            <select
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                                value={formData.target_exam}
                                onChange={(e) => setFormData({ ...formData, target_exam: e.target.value })}
                            >
                                <option value="JEE">JEE</option>
                                <option value="NEET">NEET</option>
                                <option value="BITSAT">BITSAT</option>
                            </select>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full mt-4"
                        isLoading={isLoading}
                        variant="gradient"
                    >
                        Create Account
                    </Button>

                    <div className="text-center mt-6">
                        <p className="text-sm text-slate-500">
                            Already have an account?{' '}
                            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </form>
            </Card>
        </motion.div>
    );
}
