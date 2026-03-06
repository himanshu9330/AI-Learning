import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLMotionProps<"div"> {
    gradient?: boolean;
    hover?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, gradient, hover, children, ...props }, ref) => {
        return (
            <motion.div
                ref={ref}
                initial={hover ? { y: 0 } : undefined}
                whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : undefined}
                className={cn(
                    "relative rounded-2xl border bg-slate-900/50 backdrop-blur-xl",
                    gradient
                        ? "border-transparent bg-clip-padding before:absolute before:inset-0 before:-z-10 before:rounded-2xl before:bg-gradient-to-b before:from-indigo-500/20 before:to-purple-500/20 before:p-[1px] before:content-['']"
                        : "border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)]",
                    className
                )}
                {...props}
            >
                {/* Inner highlight for depth */}
                <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/5 pointer-events-none" />
                {children}
            </motion.div>
        );
    }
);
Card.displayName = "Card";

export { Card };
