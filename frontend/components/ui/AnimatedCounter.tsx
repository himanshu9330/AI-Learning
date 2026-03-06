'use client';

import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedCounterProps {
    value: number;
    duration?: number;
    prefix?: string;
    suffix?: string;
    className?: string;
}

const AnimatedCounter = ({ value, duration = 2, prefix = '', suffix = '', className }: AnimatedCounterProps) => {
    const [displayValue, setDisplayValue] = useState(0);
    const springValue = useSpring(0, { duration: duration * 1000, bounce: 0 });
    const rounded = useTransform(springValue, (latest) => Math.round(latest));

    useEffect(() => {
        springValue.set(value);
    }, [value, springValue]);

    useEffect(() => {
        const unsubscribe = rounded.on("change", (latest) => {
            setDisplayValue(latest);
        });
        return () => unsubscribe();
    }, [rounded]);

    return (
        <span className={cn("tabular-nums", className)}>
            {prefix}{displayValue}{suffix}
        </span>
    );
};

export { AnimatedCounter };
