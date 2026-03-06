'use client';

import React from 'react';
import Link from 'next/link';
import { Brain, Twitter, Github, Linkedin, Heart } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-slate-950 border-t border-slate-900 pt-20 pb-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <Link href="/" className="flex items-center space-x-2 mb-6">
                            <Brain className="w-8 h-8 text-indigo-500" />
                            <span className="text-2xl font-bold text-white">Neuromind</span>
                        </Link>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                            Building the future of adaptive education. Our mission is to personalize learning for every student using state-of-the-art AI.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="text-white font-semibold mb-6">Platform</h4>
                        <ul className="space-y-4">
                            <li><Link href="#features" className="text-slate-400 hover:text-white transition-colors">Features</Link></li>
                            <li><Link href="#how-it-works" className="text-slate-400 hover:text-white transition-colors">How It Works</Link></li>
                            <li><Link href="/pricing" className="text-slate-400 hover:text-white transition-colors">Pricing</Link></li>
                            <li><Link href="/login" className="text-slate-400 hover:text-white transition-colors">Sign In</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-6">Connect</h4>
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white transition-all">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 hover:bg-gray-800 hover:text-white transition-all">
                                <Github className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all">
                                <Linkedin className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-slate-500 text-sm">
                        © {new Date().getFullYear()} Neuromind Inc. All rights reserved.
                    </p>
                    <p className="text-slate-600 text-sm flex items-center gap-1">
                        Made by <Heart className="w-3 h-3 text-red-500 fill-red-500" /> Himanshu
                    </p>
                </div>
            </div>
        </footer>
    );
}
