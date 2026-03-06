import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    fullWidth?: boolean;
}

const PageContainer = ({ children, className, fullWidth = false }: PageContainerProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={cn(
                "w-full px-4 sm:px-6 lg:px-8 py-8",
                !fullWidth && "max-w-7xl mx-auto",
                className
            )}
        >
            {children}
        </motion.div>
    );
};

export { PageContainer };
